import React from "react";
import { Modal } from "@/components/ui/Modal";
import { crmStore } from "@/store/CrmStore";
import { toast } from "@/components/ui/Toast";
import { fullName } from "@/lib/format";
import { DEAL_STAGES } from "@/types";
import type { Company, Contact, Deal, DealStage } from "@/types";

interface DealFormProps {
  existing: Deal | null;
  contacts: Contact[];
  companies: Company[];
  defaultStage?: DealStage;
  onClose: () => void;
}
interface DealFormState {
  title: string;
  value: string;
  stage: DealStage;
  probability: string;
  contactId: string;
  companyId: string;
  ownerName: string;
  closeDate: string;
  errors: Partial<Record<"title" | "value", string>>;
}

function toDateInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export class DealForm extends React.Component<DealFormProps, DealFormState> {
  constructor(props: DealFormProps) {
    super(props);
    const d = props.existing;
    const stage = d?.stage ?? props.defaultStage ?? "lead";
    const prob =
      d?.probability ?? DEAL_STAGES.find((s) => s.key === stage)?.defaultProbability ?? 10;
    this.state = {
      title: d?.title ?? "",
      value: d ? String(d.value) : "",
      stage,
      probability: String(prob),
      contactId: d?.contactId ?? "",
      companyId: d?.companyId ?? "",
      ownerName: d?.ownerName ?? "You",
      closeDate: toDateInput(d?.closeDate ?? ""),
      errors: {},
    };
  }

  private handleStageChange = (stage: DealStage): void => {
    const meta = DEAL_STAGES.find((s) => s.key === stage);
    this.setState({ stage, probability: String(meta?.defaultProbability ?? 10) });
  };

  private validate(): boolean {
    const errors: DealFormState["errors"] = {};
    if (!this.state.title.trim()) errors.title = "Deal title is required.";
    const value = Number(this.state.value);
    if (this.state.value === "" || Number.isNaN(value) || value < 0)
      errors.value = "Enter a valid amount.";
    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  private handleSubmit = (): void => {
    if (!this.validate()) return;
    const payload = {
      title: this.state.title.trim(),
      value: Number(this.state.value),
      stage: this.state.stage,
      probability: Math.max(0, Math.min(100, Number(this.state.probability) || 0)),
      contactId: this.state.contactId || null,
      companyId: this.state.companyId || null,
      ownerName: this.state.ownerName.trim() || "You",
      closeDate: this.state.closeDate
        ? new Date(this.state.closeDate).toISOString()
        : "",
    };
    if (this.props.existing) {
      crmStore.updateDeal(this.props.existing.id, payload);
      toast.show("Deal updated");
    } else {
      crmStore.addDeal(payload);
      toast.show(`Deal “${payload.title}” created`);
    }
    this.props.onClose();
  };

  render(): React.ReactNode {
    const { existing, contacts, companies, onClose } = this.props;
    const { errors } = this.state;
    return (
      <Modal
        title={existing ? "Edit deal" : "New deal"}
        onClose={onClose}
        footer={
          <>
            <button className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" onClick={this.handleSubmit}>
              {existing ? "Save changes" : "Create deal"}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="field field--full">
            <label>Deal title</label>
            <input
              className={errors.title ? "invalid" : ""}
              value={this.state.title}
              onChange={(e) => this.setState({ title: e.target.value })}
              placeholder="e.g. Acme — Platform rollout"
              autoFocus
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>
          <div className="field">
            <label>Value (USD)</label>
            <input
              className={errors.value ? "invalid" : ""}
              type="number"
              min="0"
              value={this.state.value}
              onChange={(e) => this.setState({ value: e.target.value })}
              placeholder="0"
            />
            {errors.value && <span className="error-text">{errors.value}</span>}
          </div>
          <div className="field">
            <label>Stage</label>
            <select
              value={this.state.stage}
              onChange={(e) => this.handleStageChange(e.target.value as DealStage)}
            >
              {DEAL_STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Probability (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={this.state.probability}
              onChange={(e) => this.setState({ probability: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Expected close</label>
            <input
              type="date"
              value={this.state.closeDate}
              onChange={(e) => this.setState({ closeDate: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Primary contact</label>
            <select
              value={this.state.contactId}
              onChange={(e) => this.setState({ contactId: e.target.value })}
            >
              <option value="">— None —</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {fullName(c.firstName, c.lastName)}
                </option>
              ))}
            </select>
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
            <label>Owner</label>
            <input
              value={this.state.ownerName}
              onChange={(e) => this.setState({ ownerName: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    );
  }
}
