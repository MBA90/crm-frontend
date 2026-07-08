export type ID = string;

export type ContactStatus = "lead" | "active" | "inactive";

export interface Contact {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  companyId: ID | null;
  status: ContactStatus;
  tags: string[];
  notes: string;
  createdAt: string;
}

export interface Company {
  id: ID;
  name: string;
  industry: string;
  website: string;
  size: string;
  location: string;
  createdAt: string;
}

export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface Deal {
  id: ID;
  title: string;
  value: number;
  stage: DealStage;
  probability: number;
  contactId: ID | null;
  companyId: ID | null;
  ownerName: string;
  closeDate: string;
  createdAt: string;
}

export type TaskPriority = "low" | "medium" | "high";
export type TaskType = "call" | "email" | "meeting" | "todo";

export interface Task {
  id: ID;
  title: string;
  type: TaskType;
  priority: TaskPriority;
  dueDate: string;
  done: boolean;
  relatedContactId: ID | null;
  createdAt: string;
}

export type ActivityKind = "deal" | "contact" | "task" | "company";

export interface Activity {
  id: ID;
  message: string;
  kind: ActivityKind;
  timestamp: string;
}

export interface CrmState {
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  tasks: Task[];
  activities: Activity[];
}

export const DEAL_STAGES: { key: DealStage; label: string; defaultProbability: number }[] = [
  { key: "lead", label: "Lead", defaultProbability: 10 },
  { key: "qualified", label: "Qualified", defaultProbability: 30 },
  { key: "proposal", label: "Proposal", defaultProbability: 55 },
  { key: "negotiation", label: "Negotiation", defaultProbability: 75 },
  { key: "won", label: "Won", defaultProbability: 100 },
  { key: "lost", label: "Lost", defaultProbability: 0 },
];

// Stages shown as pipeline columns (won/lost handled separately in board footer).
export const PIPELINE_STAGES: DealStage[] = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
];
