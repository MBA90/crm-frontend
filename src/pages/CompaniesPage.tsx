import React from "react";
import { StoreComponent } from "@/store/StoreComponent";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { CompanyForm } from "@/components/forms/CompanyForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { formatCompact } from "@/lib/format";
import { avatarColor } from "@/lib/format";
import type { Company } from "@/types";

const OPEN = ["lead", "qualified", "proposal", "negotiation"];

interface CompaniesState {
  query: string;
  showForm: boolean;
  editing: Company | null;
  deleting: Company | null;
}

export class CompaniesPage extends StoreComponent<{}, CompaniesState> {
  state: CompaniesState = {
    query: "",
    showForm: false,
    editing: null,
    deleting: null,
  };

  private filtered(): Company[] {
    const q = this.state.query.trim().toLowerCase();
    const companies = this.store.getState().companies;
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
    );
  }

  private statsFor(companyId: string): {
    contacts: number;
    deals: number;
    pipeline: number;
  } {
    const s = this.store.getState();
    const contacts = s.contacts.filter((c) => c.companyId === companyId).length;
    const companyDeals = s.deals.filter((d) => d.companyId === companyId);
    const deals = companyDeals.length;
    const pipeline = companyDeals
      .filter((d) => OPEN.includes(d.stage))
      .reduce((sum, d) => sum + d.value, 0);
    return { contacts, deals, pipeline };
  }

  private confirmDelete = (): void => {
    if (!this.state.deleting) return;
    const name = this.state.deleting.name;
    this.store.deleteCompany(this.state.deleting.id);
    this.setState({ deleting: null });
    toast.show(`${name} deleted`);
  };

  render(): React.ReactNode {
    const rows = this.filtered();
    const total = this.store.getState().companies.length;

    return (
      <>
        <div className="page-head">
          <div>
            <h1>Companies</h1>
            <p>{total} accounts in your workspace.</p>
          </div>
          <button
            className="btn btn--primary"
            onClick={() => this.setState({ showForm: true, editing: null })}
          >
            <Icon name="plus" size={16} />
            New company
          </button>
        </div>

        <div className="toolbar">
          <div className="search-inline">
            <Icon name="search" size={16} />
            <input
              placeholder="Search companies…"
              value={this.state.query}
              onChange={(e) => this.setState({ query: e.target.value })}
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="companies"
              title="No companies found"
              message={
                this.state.query
                  ? "Try a different search."
                  : "Add your first company to organize your contacts and deals."
              }
              actionLabel="New company"
              onAction={() => this.setState({ showForm: true, editing: null })}
            />
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {rows.map((co) => {
              const st = this.statsFor(co.id);
              return (
                <div className="card" key={co.id}>
                  <div className="card__body">
                    <div className="row" style={{ alignItems: "flex-start" }}>
                      <div
                        className="avatar"
                        style={{ background: avatarColor(co.id), borderRadius: 11 }}
                      >
                        {co.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="cell-primary" style={{ fontSize: 15 }}>
                          {co.name}
                        </div>
                        <div className="cell-sub">{co.industry || "—"}</div>
                      </div>
                      <div className="row-actions" style={{ opacity: 1 }}>
                        <button
                          className="icon-btn"
                          aria-label="Edit"
                          onClick={() => this.setState({ showForm: true, editing: co })}
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          aria-label="Delete"
                          onClick={() => this.setState({ deleting: co })}
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </div>

                    <div
                      className="row"
                      style={{ gap: 14, marginTop: 14, color: "var(--muted)", fontSize: 12.5 }}
                    >
                      {co.location && (
                        <span className="row" style={{ gap: 5 }}>
                          <Icon name="globe" size={13} /> {co.location}
                        </span>
                      )}
                      <span className="row" style={{ gap: 5 }}>
                        <Icon name="user" size={13} /> {co.size}
                      </span>
                    </div>

                    <div className="divider" style={{ margin: "14px 0" }} />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 8,
                        textAlign: "center",
                      }}
                    >
                      <div>
                        <div className="cell-num" style={{ fontSize: 17 }}>
                          {st.contacts}
                        </div>
                        <div className="cell-sub">Contacts</div>
                      </div>
                      <div>
                        <div className="cell-num" style={{ fontSize: 17 }}>
                          {st.deals}
                        </div>
                        <div className="cell-sub">Deals</div>
                      </div>
                      <div>
                        <div
                          className="cell-num"
                          style={{ fontSize: 17, color: "var(--primary)" }}
                        >
                          {formatCompact(st.pipeline)}
                        </div>
                        <div className="cell-sub">Pipeline</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {this.state.showForm && (
          <CompanyForm
            existing={this.state.editing}
            onClose={() => this.setState({ showForm: false, editing: null })}
          />
        )}

        {this.state.deleting && (
          <ConfirmDialog
            title="Delete company"
            message={`Delete ${this.state.deleting.name}? Linked contacts and deals will be unassigned.`}
            onConfirm={this.confirmDelete}
            onCancel={() => this.setState({ deleting: null })}
          />
        )}
      </>
    );
  }
}
