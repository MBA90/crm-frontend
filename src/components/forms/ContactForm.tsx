import React from "react";
import { Modal } from "@/components/ui/Modal";
import { crmStore } from "@/store/CrmStore";
import { toast } from "@/components/ui/Toast";
import { fullName } from "@/lib/format";
import type { Company, Contact, ContactStatus } from "@/types";

interface ContactFormProps {
  existing: Contact | null;
  companies: Company[];
  onClose: () => void;
}
interface ContactFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  companyId: string;
  status: ContactStatus;
  tags: string;
  notes: string;
  errors: Partial<Record<"firstName" | "lastName" | "email", string>>;
}

export class ContactForm extends React.Component<ContactFormProps, ContactFormState> {
  constructor(props: ContactFormProps) {
    super(props);
    const c = props.existing;
    this.state = {
      firstName: c?.firstName ?? "",
      lastName: c?.lastName ?? "",
      email: c?.email ?? "",
      phone: c?.phone ?? "",
      title: c?.title ?? "",
      companyId: c?.companyId ?? "",
      status: c?.status ?? "lead",
      tags: c?.tags.join(", ") ?? "",
      notes: c?.notes ?? "",
      errors: {},
    };
  }

  private validate(): boolean {
    const errors: ContactFormState["errors"] = {};
    if (!this.state.firstName.trim()) errors.firstName = "First name is required.";
    if (!this.state.lastName.trim()) errors.lastName = "Last name is required.";
    const email = this.state.email.trim();
    if (!email) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Enter a valid email address.";
    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  private handleSubmit = (): void => {
    if (!this.validate()) return;
    const payload = {
      firstName: this.state.firstName.trim(),
      lastName: this.state.lastName.trim(),
      email: this.state.email.trim(),
      phone: this.state.phone.trim(),
      title: this.state.title.trim(),
      companyId: this.state.companyId || null,
      status: this.state.status,
      tags: this.state.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes: this.state.notes.trim(),
    };
    if (this.props.existing) {
      crmStore.updateContact(this.props.existing.id, payload);
      toast.show("Contact updated");
    } else {
      crmStore.addContact(payload);
      toast.show(`${fullName(payload.firstName, payload.lastName)} added`);
    }
    this.props.onClose();
  };

  render(): React.ReactNode {
    const { existing, companies, onClose } = this.props;
    const { errors } = this.state;
    return (
      <Modal
        title={existing ? "Edit contact" : "New contact"}
        onClose={onClose}
        footer={
          <>
            <button className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" onClick={this.handleSubmit}>
              {existing ? "Save changes" : "Add contact"}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="field">
            <label>First name</label>
            <input
              className={errors.firstName ? "invalid" : ""}
              value={this.state.firstName}
              onChange={(e) => this.setState({ firstName: e.target.value })}
              autoFocus
            />
            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
          </div>
          <div className="field">
            <label>Last name</label>
            <input
              className={errors.lastName ? "invalid" : ""}
              value={this.state.lastName}
              onChange={(e) => this.setState({ lastName: e.target.value })}
            />
            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
          </div>
          <div className="field">
            <label>Email</label>
            <input
              className={errors.email ? "invalid" : ""}
              value={this.state.email}
              onChange={(e) => this.setState({ email: e.target.value })}
              placeholder="name@company.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div className="field">
            <label>Phone</label>
            <input
              value={this.state.phone}
              onChange={(e) => this.setState({ phone: e.target.value })}
              placeholder="+1 555 000 0000"
            />
          </div>
          <div className="field">
            <label>Job title</label>
            <input
              value={this.state.title}
              onChange={(e) => this.setState({ title: e.target.value })}
              placeholder="e.g. VP Sales"
            />
          </div>
          <div className="field">
            <label>Company</label>
            <select
              value={this.state.companyId}
              onChange={(e) => this.setState({ companyId: e.target.value })}
            >
              <option value="">— None —</option>
              {companies.map((co) => (
                <option key={co.id} value={co.id}>
                  {co.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select
              value={this.state.status}
              onChange={(e) =>
                this.setState({ status: e.target.value as ContactStatus })
              }
            >
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="field">
            <label>Tags</label>
            <input
              value={this.state.tags}
              onChange={(e) => this.setState({ tags: e.target.value })}
              placeholder="comma, separated"
            />
            <span className="hint">Separate tags with commas.</span>
          </div>
          <div className="field field--full">
            <label>Notes</label>
            <textarea
              value={this.state.notes}
              onChange={(e) => this.setState({ notes: e.target.value })}
              placeholder="Context, next steps, preferences…"
            />
          </div>
        </div>
      </Modal>
    );
  }
}
