import React from "react";
import { Link } from "react-router-dom";
import { StoreComponent } from "@/store/StoreComponent";
import { withRouter, type RouterProps } from "@/lib/withRouter";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { avatarColor } from "@/lib/format";
import type { Company } from "@/types";

interface CompaniesProps {
  router: RouterProps;
}
interface CompaniesState {
  query: string;
  deleting: Company | null;
}

class CompaniesBase extends StoreComponent<CompaniesProps, CompaniesState> {
  state: CompaniesState = {
    query: "",
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

  private confirmDelete = (): void => {
    if (!this.state.deleting) return;
    const name = this.state.deleting.name;
    this.store.deleteCompany(this.state.deleting.id);
    this.setState({ deleting: null });
    toast.show(`${name} deleted`);
  };

  render(): React.ReactNode {
    const { navigate } = this.props.router;
    const rows = this.filtered();
    const total = this.store.getState().companies.length;

    return (
      <>
        <div className="page-head">
          <div>
            <h1>Accounts</h1>
            <p>{total} accounts in your workspace.</p>
          </div>
          <Link className="btn btn--primary" to="/accounts/new">
            <Icon name="plus" size={16} />
            New account request
          </Link>
        </div>

        <div className="toolbar">
          <div className="search-inline">
            <Icon name="search" size={16} />
            <input
              placeholder="Search accounts…"
              value={this.state.query}
              onChange={(e) => this.setState({ query: e.target.value })}
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="companies"
              title="No accounts found"
              message={
                this.state.query
                  ? "Try a different search."
                  : "Submit an account request to get your first account approved."
              }
              actionLabel="New account request"
              onAction={() => navigate("/accounts/new")}
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
            {rows.map((co) => (
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
                </div>
              </div>
            ))}
          </div>
        )}

        {this.state.deleting && (
          <ConfirmDialog
            title="Delete account"
            message={`Delete ${this.state.deleting.name}? Linked contacts and deals will be unassigned.`}
            onConfirm={this.confirmDelete}
            onCancel={() => this.setState({ deleting: null })}
          />
        )}
      </>
    );
  }
}

export const CompaniesPage = withRouter(CompaniesBase);
