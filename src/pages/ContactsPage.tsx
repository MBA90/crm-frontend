import React from "react";
import { StoreComponent } from "@/store/StoreComponent";
import { withRouter, type RouterProps } from "@/lib/withRouter";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { ContactStatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContactForm } from "@/components/forms/ContactForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { fullName, initials, formatDate } from "@/lib/format";
import type { Contact, ContactStatus } from "@/types";

type StatusFilter = "all" | ContactStatus;

interface ContactsProps {
  router: RouterProps;
}
interface ContactsState {
  query: string;
  status: StatusFilter;
  showForm: boolean;
  editing: Contact | null;
  deleting: Contact | null;
}

class ContactsBase extends StoreComponent<ContactsProps, ContactsState> {
  state: ContactsState = {
    query: "",
    status: "all",
    showForm: false,
    editing: null,
    deleting: null,
  };

  private filtered(): Contact[] {
    const q = this.state.query.trim().toLowerCase();
    return this.store.getState().contacts.filter((c) => {
      if (this.state.status !== "all" && c.status !== this.state.status) return false;
      if (!q) return true;
      const company = this.store.companyById(c.companyId);
      return (
        fullName(c.firstName, c.lastName).toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        (company?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }

  private confirmDelete = (): void => {
    if (!this.state.deleting) return;
    const name = fullName(this.state.deleting.firstName, this.state.deleting.lastName);
    this.store.deleteContact(this.state.deleting.id);
    this.setState({ deleting: null });
    toast.show(`${name} deleted`);
  };

  render(): React.ReactNode {
    const { navigate } = this.props.router;
    const rows = this.filtered();
    const total = this.store.getState().contacts.length;
    const filters: { key: StatusFilter; label: string }[] = [
      { key: "all", label: "All" },
      { key: "active", label: "Active" },
      { key: "lead", label: "Leads" },
      { key: "inactive", label: "Inactive" },
    ];

    return (
      <>
        <div className="page-head">
          <div>
            <h1>Contacts</h1>
            <p>{total} people across your accounts.</p>
          </div>
          <button
            className="btn btn--primary"
            onClick={() => this.setState({ showForm: true, editing: null })}
          >
            <Icon name="plus" size={16} />
            New contact
          </button>
        </div>

        <div className="toolbar">
          <div className="search-inline">
            <Icon name="search" size={16} />
            <input
              placeholder="Search by name, email, company…"
              value={this.state.query}
              onChange={(e) => this.setState({ query: e.target.value })}
            />
          </div>
          <div className="seg">
            {filters.map((f) => (
              <button
                key={f.key}
                className={this.state.status === f.key ? "active" : ""}
                onClick={() => this.setState({ status: f.key })}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          {rows.length === 0 ? (
            <EmptyState
              icon="contacts"
              title="No contacts found"
              message={
                this.state.query || this.state.status !== "all"
                  ? "Try adjusting your search or filters."
                  : "Add your first contact to get started."
              }
              actionLabel="New contact"
              onAction={() => this.setState({ showForm: true, editing: null })}
            />
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Added</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => {
                    const company = this.store.companyById(c.companyId);
                    return (
                      <tr key={c.id} onClick={() => navigate(`/contacts/${c.id}`)}>
                        <td>
                          <div className="person-cell">
                            <Avatar
                              label={initials(c.firstName, c.lastName)}
                              seed={c.id}
                            />
                            <div>
                              <div className="cell-primary">
                                {fullName(c.firstName, c.lastName)}
                              </div>
                              <div className="cell-sub">{c.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="cell-sub">{c.title || "—"}</td>
                        <td className="cell-sub">{company?.name ?? "—"}</td>
                        <td>
                          <ContactStatusBadge status={c.status} />
                        </td>
                        <td className="cell-sub">{formatDate(c.createdAt)}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-btn"
                              aria-label="Edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                this.setState({ showForm: true, editing: c });
                              }}
                            >
                              <Icon name="edit" size={16} />
                            </button>
                            <button
                              className="icon-btn"
                              aria-label="Delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                this.setState({ deleting: c });
                              }}
                            >
                              <Icon name="trash" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {this.state.showForm && (
          <ContactForm
            existing={this.state.editing}
            companies={this.store.getState().companies}
            onClose={() => this.setState({ showForm: false, editing: null })}
          />
        )}

        {this.state.deleting && (
          <ConfirmDialog
            title="Delete contact"
            message={`Delete ${fullName(
              this.state.deleting.firstName,
              this.state.deleting.lastName
            )}? This can’t be undone.`}
            onConfirm={this.confirmDelete}
            onCancel={() => this.setState({ deleting: null })}
          />
        )}
      </>
    );
  }
}

export const ContactsPage = withRouter(ContactsBase);
