import type {
  Activity,
  Company,
  Contact,
  CrmState,
  Deal,
  Task,
} from "@/types";
import { DEAL_STAGES } from "@/types";
import { buildSeed } from "@/data/seed";
import { fullName, todayISO, uid } from "@/lib/format";

const STORAGE_KEY = "sanad-crm.state.v1";
type Listener = () => void;

/**
 * A tiny observable store. Class components subscribe in componentDidMount and
 * unsubscribe in componentWillUnmount. All mutations flow through here so state
 * stays consistent and is persisted to localStorage.
 */
class CrmStore {
  private state: CrmState;
  private listeners = new Set<Listener>();

  constructor() {
    this.state = this.load();
  }

  private load(): CrmState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as CrmState;
    } catch {
      /* ignore malformed storage */
    }
    const seeded = buildSeed();
    this.persist(seeded);
    return seeded;
  }

  private persist(next: CrmState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage may be unavailable; keep in-memory state */
    }
  }

  private commit(next: CrmState): void {
    this.state = next;
    this.persist(next);
    this.listeners.forEach((l) => l());
  }

  getState(): CrmState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  resetToSeed(): void {
    const seeded = buildSeed();
    this.commit(seeded);
  }

  clearAll(): void {
    this.commit({
      contacts: [],
      companies: [],
      deals: [],
      tasks: [],
      activities: [],
    });
  }

  private logActivity(activity: Omit<Activity, "id" | "timestamp">): Activity {
    return {
      ...activity,
      id: uid("ac"),
      timestamp: todayISO(),
    };
  }

  // ---- lookups -----------------------------------------------------------
  companyById(id: string | null): Company | undefined {
    if (!id) return undefined;
    return this.state.companies.find((c) => c.id === id);
  }

  contactById(id: string | null): Contact | undefined {
    if (!id) return undefined;
    return this.state.contacts.find((c) => c.id === id);
  }

  // ---- contacts ----------------------------------------------------------
  addContact(data: Omit<Contact, "id" | "createdAt">): Contact {
    const contact: Contact = { ...data, id: uid("ct"), createdAt: todayISO() };
    const activity = this.logActivity({
      message: `Added contact ${fullName(contact.firstName, contact.lastName)}`,
      kind: "contact",
    });
    this.commit({
      ...this.state,
      contacts: [contact, ...this.state.contacts],
      activities: [activity, ...this.state.activities],
    });
    return contact;
  }

  updateContact(id: string, patch: Partial<Contact>): void {
    this.commit({
      ...this.state,
      contacts: this.state.contacts.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    });
  }

  deleteContact(id: string): void {
    const contact = this.contactById(id);
    const activity = this.logActivity({
      message: `Deleted contact ${
        contact ? fullName(contact.firstName, contact.lastName) : ""
      }`.trim(),
      kind: "contact",
    });
    this.commit({
      ...this.state,
      contacts: this.state.contacts.filter((c) => c.id !== id),
      deals: this.state.deals.map((d) =>
        d.contactId === id ? { ...d, contactId: null } : d
      ),
      tasks: this.state.tasks.map((t) =>
        t.relatedContactId === id ? { ...t, relatedContactId: null } : t
      ),
      activities: [activity, ...this.state.activities],
    });
  }

  // ---- companies ---------------------------------------------------------
  addCompany(data: Omit<Company, "id" | "createdAt">): Company {
    const company: Company = { ...data, id: uid("co"), createdAt: todayISO() };
    const activity = this.logActivity({
      message: `New company ${company.name} created`,
      kind: "company",
    });
    this.commit({
      ...this.state,
      companies: [company, ...this.state.companies],
      activities: [activity, ...this.state.activities],
    });
    return company;
  }

  updateCompany(id: string, patch: Partial<Company>): void {
    this.commit({
      ...this.state,
      companies: this.state.companies.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    });
  }

  deleteCompany(id: string): void {
    this.commit({
      ...this.state,
      companies: this.state.companies.filter((c) => c.id !== id),
      contacts: this.state.contacts.map((c) =>
        c.companyId === id ? { ...c, companyId: null } : c
      ),
      deals: this.state.deals.map((d) =>
        d.companyId === id ? { ...d, companyId: null } : d
      ),
    });
  }

  // ---- deals -------------------------------------------------------------
  addDeal(data: Omit<Deal, "id" | "createdAt">): Deal {
    const deal: Deal = { ...data, id: uid("dl"), createdAt: todayISO() };
    const activity = this.logActivity({
      message: `Created deal “${deal.title}”`,
      kind: "deal",
    });
    this.commit({
      ...this.state,
      deals: [deal, ...this.state.deals],
      activities: [activity, ...this.state.activities],
    });
    return deal;
  }

  updateDeal(id: string, patch: Partial<Deal>): void {
    this.commit({
      ...this.state,
      deals: this.state.deals.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    });
  }

  moveDealStage(id: string, stage: Deal["stage"]): void {
    const deal = this.state.deals.find((d) => d.id === id);
    if (!deal || deal.stage === stage) return;
    const meta = DEAL_STAGES.find((s) => s.key === stage);
    const label = meta?.label ?? stage;
    const activity = this.logActivity({
      message:
        stage === "won"
          ? `Won deal “${deal.title}”`
          : stage === "lost"
          ? `Marked deal “${deal.title}” as lost`
          : `Moved “${deal.title}” to ${label}`,
      kind: "deal",
    });
    this.commit({
      ...this.state,
      deals: this.state.deals.map((d) =>
        d.id === id
          ? { ...d, stage, probability: meta?.defaultProbability ?? d.probability }
          : d
      ),
      activities: [activity, ...this.state.activities],
    });
  }

  deleteDeal(id: string): void {
    this.commit({
      ...this.state,
      deals: this.state.deals.filter((d) => d.id !== id),
    });
  }

  // ---- tasks -------------------------------------------------------------
  addTask(data: Omit<Task, "id" | "createdAt">): Task {
    const task: Task = { ...data, id: uid("tk"), createdAt: todayISO() };
    this.commit({
      ...this.state,
      tasks: [task, ...this.state.tasks],
    });
    return task;
  }

  updateTask(id: string, patch: Partial<Task>): void {
    this.commit({
      ...this.state,
      tasks: this.state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  }

  toggleTask(id: string): void {
    const task = this.state.tasks.find((t) => t.id === id);
    if (!task) return;
    const nextDone = !task.done;
    const activities = nextDone
      ? [
          this.logActivity({
            message: `Completed task “${task.title}”`,
            kind: "task",
          }),
          ...this.state.activities,
        ]
      : this.state.activities;
    this.commit({
      ...this.state,
      tasks: this.state.tasks.map((t) =>
        t.id === id ? { ...t, done: nextDone } : t
      ),
      activities,
    });
  }

  deleteTask(id: string): void {
    this.commit({
      ...this.state,
      tasks: this.state.tasks.filter((t) => t.id !== id),
    });
  }
}

export const crmStore = new CrmStore();
