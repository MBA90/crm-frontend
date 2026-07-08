import React from "react";
import { StoreComponent } from "@/store/StoreComponent";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";

interface SettingsState {
  confirm: "reset" | "clear" | null;
}

export class SettingsPage extends StoreComponent<{}, SettingsState> {
  state: SettingsState = { confirm: null };

  private counts() {
    const s = this.store.getState();
    return {
      contacts: s.contacts.length,
      companies: s.companies.length,
      deals: s.deals.length,
      tasks: s.tasks.length,
    };
  }

  render(): React.ReactNode {
    const c = this.counts();
    return (
      <>
        <div className="page-head">
          <div>
            <h1>Settings</h1>
            <p>Manage your profile and workspace data.</p>
          </div>
        </div>

        <div className="grid-2">
          <div className="stack">
            <div className="card">
              <div className="card__head">
                <h3>Profile</h3>
              </div>
              <div className="card__body">
                <div className="detail-head" style={{ marginBottom: 18 }}>
                  <Avatar label="AR" seed="account-owner" size="lg" />
                  <div className="detail-head__meta">
                    <h1 style={{ fontSize: 19 }}>Alex Rivera</h1>
                    <p>Sales Manager</p>
                  </div>
                </div>
                <dl className="kv">
                  <dt>Email</dt>
                  <dd>alex.rivera@nexuscrm.app</dd>
                  <dt>Role</dt>
                  <dd>Sales Manager</dd>
                  <dt>Timezone</dt>
                  <dd>GMT+04 · Gulf Standard Time</dd>
                  <dt>Plan</dt>
                  <dd>
                    <span className="badge badge--primary">Team</span>
                  </dd>
                </dl>
              </div>
            </div>

            <div className="card">
              <div className="card__head">
                <h3>Data management</h3>
              </div>
              <div className="card__body">
                <p style={{ marginTop: 0, color: "var(--text-2)", lineHeight: 1.6 }}>
                  Your data is stored locally in this browser. Reset to reload the
                  demo dataset, or clear everything to start from an empty workspace.
                </p>
                <div className="row" style={{ gap: 10, marginTop: 6 }}>
                  <button
                    className="btn btn--ghost"
                    onClick={() => this.setState({ confirm: "reset" })}
                  >
                    <Icon name="download" size={16} /> Reload demo data
                  </button>
                  <button
                    className="btn btn--danger"
                    onClick={() => this.setState({ confirm: "clear" })}
                  >
                    <Icon name="trash" size={16} /> Clear all data
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="stack">
            <div className="card">
              <div className="card__head">
                <h3>Workspace</h3>
              </div>
              <div className="card__body">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {[
                    { label: "Contacts", value: c.contacts, icon: "contacts" as const },
                    { label: "Companies", value: c.companies, icon: "companies" as const },
                    { label: "Deals", value: c.deals, icon: "deals" as const },
                    { label: "Tasks", value: c.tasks, icon: "tasks" as const },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        padding: 14,
                      }}
                    >
                      <div className="row" style={{ color: "var(--muted)", gap: 7 }}>
                        <Icon name={item.icon} size={15} />
                        <span style={{ fontSize: 12.5, fontWeight: 500 }}>
                          {item.label}
                        </span>
                      </div>
                      <div
                        className="cell-num"
                        style={{ fontSize: 24, marginTop: 6, fontWeight: 600 }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card__head">
                <h3>About</h3>
              </div>
              <div className="card__body">
                <p style={{ margin: 0, color: "var(--text-2)", lineHeight: 1.6 }}>
                  Nexus CRM — a demo customer-relationship manager built with React,
                  TypeScript, and class components. No backend required; state persists
                  in your browser via localStorage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {this.state.confirm === "reset" && (
          <ConfirmDialog
            title="Reload demo data"
            message="This replaces your current data with the sample dataset. Continue?"
            confirmLabel="Reload"
            onConfirm={() => {
              this.store.resetToSeed();
              this.setState({ confirm: null });
              toast.show("Demo data restored");
            }}
            onCancel={() => this.setState({ confirm: null })}
          />
        )}

        {this.state.confirm === "clear" && (
          <ConfirmDialog
            title="Clear all data"
            message="This permanently removes all contacts, companies, deals, and tasks. Continue?"
            confirmLabel="Clear everything"
            onConfirm={() => {
              this.store.clearAll();
              this.setState({ confirm: null });
              toast.show("Workspace cleared");
            }}
            onCancel={() => this.setState({ confirm: null })}
          />
        )}
      </>
    );
  }
}
