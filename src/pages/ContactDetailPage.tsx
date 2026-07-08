import React from "react";
import { StoreComponent } from "@/store/StoreComponent";
import { withRouter, type RouterProps } from "@/lib/withRouter";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import {
  ContactStatusBadge,
  DealStageBadge,
  PriorityBadge,
} from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ContactForm } from "@/components/forms/ContactForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { fullName, initials, formatCurrency, formatDate } from "@/lib/format";

interface DetailProps {
  router: RouterProps;
}
interface DetailState {
  editing: boolean;
  deleting: boolean;
}

class ContactDetailBase extends StoreComponent<DetailProps, DetailState> {
  state: DetailState = { editing: false, deleting: false };

  render(): React.ReactNode {
    const { navigate, params } = this.props.router;
    const id = params.id ?? "";
    const contact = this.store.contactById(id);

    if (!contact) {
      return (
        <>
          <div className="back-link" onClick={() => navigate("/contacts")}>
            <Icon name="back" size={15} /> Back to contacts
          </div>
          <div className="card">
            <EmptyState
              icon="contacts"
              title="Contact not found"
              message="This contact may have been deleted."
              actionLabel="Back to contacts"
              onAction={() => navigate("/contacts")}
            />
          </div>
        </>
      );
    }

    const company = this.store.companyById(contact.companyId);
    const state = this.store.getState();
    const deals = state.deals.filter((d) => d.contactId === contact.id);
    const tasks = state.tasks.filter((t) => t.relatedContactId === contact.id);

    return (
      <>
        <div className="back-link" onClick={() => navigate("/contacts")}>
          <Icon name="back" size={15} /> Back to contacts
        </div>

        <div className="page-head">
          <div className="detail-head" style={{ marginBottom: 0 }}>
            <Avatar
              label={initials(contact.firstName, contact.lastName)}
              seed={contact.id}
              size="lg"
            />
            <div className="detail-head__meta">
              <h1>{fullName(contact.firstName, contact.lastName)}</h1>
              <p>
                {contact.title || "—"}
                {company ? ` · ${company.name}` : ""}
              </p>
            </div>
          </div>
          <div className="row">
            <button
              className="btn btn--ghost"
              onClick={() => this.setState({ editing: true })}
            >
              <Icon name="edit" size={16} /> Edit
            </button>
            <button
              className="btn btn--danger"
              onClick={() => this.setState({ deleting: true })}
            >
              <Icon name="trash" size={16} /> Delete
            </button>
          </div>
        </div>

        <div className="grid-2">
          <div className="stack">
            <div className="card">
              <div className="card__head">
                <h3>Details</h3>
                <ContactStatusBadge status={contact.status} />
              </div>
              <div className="card__body">
                <dl className="kv">
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${contact.email}`} style={{ color: "var(--primary)" }}>
                      {contact.email}
                    </a>
                  </dd>
                  <dt>Phone</dt>
                  <dd>{contact.phone || "—"}</dd>
                  <dt>Company</dt>
                  <dd>{company?.name ?? "—"}</dd>
                  <dt>Title</dt>
                  <dd>{contact.title || "—"}</dd>
                  <dt>Added</dt>
                  <dd>{formatDate(contact.createdAt)}</dd>
                </dl>
                {contact.tags.length > 0 && (
                  <>
                    <div className="divider" />
                    <div className="section-title">Tags</div>
                    <div>
                      {contact.tags.map((t) => (
                        <span className="tag" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {contact.notes && (
                  <>
                    <div className="divider" />
                    <div className="section-title">Notes</div>
                    <p style={{ margin: 0, color: "var(--text-2)", lineHeight: 1.6 }}>
                      {contact.notes}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="stack">
            <div className="card">
              <div className="card__head">
                <h3>Deals</h3>
                <span className="muted mono" style={{ fontSize: 13 }}>
                  {deals.length}
                </span>
              </div>
              {deals.length === 0 ? (
                <div className="card__body muted">No deals linked to this contact.</div>
              ) : (
                <div className="card__body" style={{ display: "grid", gap: 10 }}>
                  {deals.map((d) => (
                    <div
                      key={d.id}
                      className="row"
                      style={{
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate("/deals")}
                    >
                      <div>
                        <div className="cell-primary">{d.title}</div>
                        <div style={{ marginTop: 4 }}>
                          <DealStageBadge stage={d.stage} />
                        </div>
                      </div>
                      <span className="cell-num">{formatCurrency(d.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="card__head">
                <h3>Tasks</h3>
                <span className="muted mono" style={{ fontSize: 13 }}>
                  {tasks.length}
                </span>
              </div>
              {tasks.length === 0 ? (
                <div className="card__body muted">No tasks for this contact.</div>
              ) : (
                <div>
                  {tasks.map((t) => (
                    <div className={`task-item${t.done ? " done" : ""}`} key={t.id}>
                      <button
                        className={`checkbox${t.done ? " checked" : ""}`}
                        onClick={() => this.store.toggleTask(t.id)}
                        aria-label="Toggle task"
                      >
                        {t.done && <Icon name="check" size={13} />}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div className="task-item__title">{t.title}</div>
                        <div className="task-item__sub">Due {formatDate(t.dueDate)}</div>
                      </div>
                      <PriorityBadge priority={t.priority} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {this.state.editing && (
          <ContactForm
            existing={contact}
            companies={state.companies}
            onClose={() => this.setState({ editing: false })}
          />
        )}

        {this.state.deleting && (
          <ConfirmDialog
            title="Delete contact"
            message={`Delete ${fullName(
              contact.firstName,
              contact.lastName
            )}? This can’t be undone.`}
            onConfirm={() => {
              this.store.deleteContact(contact.id);
              toast.show("Contact deleted");
              navigate("/contacts");
            }}
            onCancel={() => this.setState({ deleting: false })}
          />
        )}
      </>
    );
  }
}

export const ContactDetailPage = withRouter(ContactDetailBase);
