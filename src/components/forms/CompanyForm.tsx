import React from "react";
import { Modal } from "@/components/ui/Modal";
import { crmStore } from "@/store/CrmStore";
import { toast } from "@/components/ui/Toast";
import type { Company } from "@/types";

interface CompanyFormProps {
  existing: Company | null;
  onClose: () => void;
}
interface CompanyFormState {
  name: string;
  industry: string;
  website: string;
  size: string;
  location: string;
  error: string;
}

const SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export class CompanyForm extends React.Component<CompanyFormProps, CompanyFormState> {
  constructor(props: CompanyFormProps) {
    super(props);
    const c = props.existing;
    this.state = {
      name: c?.name ?? "",
      industry: c?.industry ?? "",
      website: c?.website ?? "",
      size: c?.size ?? "11-50",
      location: c?.location ?? "",
      error: "",
    };
  }

  private handleSubmit = (): void => {
    if (!this.state.name.trim()) {
      this.setState({ error: "Company name is required." });
      return;
    }
    const payload = {
      name: this.state.name.trim(),
      industry: this.state.industry.trim(),
      website: this.state.website.trim(),
      size: this.state.size,
      location: this.state.location.trim(),
    };
    if (this.props.existing) {
      crmStore.updateCompany(this.props.existing.id, payload);
      toast.show("Company updated");
    } else {
      crmStore.addCompany(payload);
      toast.show(`${payload.name} added`);
    }
    this.props.onClose();
  };

  render(): React.ReactNode {
    const { existing, onClose } = this.props;
    const { error } = this.state;
    return (
      <Modal
        title={existing ? "Edit company" : "New company"}
        onClose={onClose}
        footer={
          <>
            <button className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" onClick={this.handleSubmit}>
              {existing ? "Save changes" : "Add company"}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="field field--full">
            <label>Company name</label>
            <input
              className={error ? "invalid" : ""}
              value={this.state.name}
              onChange={(e) => this.setState({ name: e.target.value, error: "" })}
              autoFocus
            />
            {error && <span className="error-text">{error}</span>}
          </div>
          <div className="field">
            <label>Industry</label>
            <input
              value={this.state.industry}
              onChange={(e) => this.setState({ industry: e.target.value })}
              placeholder="e.g. Logistics"
            />
          </div>
          <div className="field">
            <label>Company size</label>
            <select
              value={this.state.size}
              onChange={(e) => this.setState({ size: e.target.value })}
            >
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s} employees
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Website</label>
            <input
              value={this.state.website}
              onChange={(e) => this.setState({ website: e.target.value })}
              placeholder="example.com"
            />
          </div>
          <div className="field">
            <label>Location</label>
            <input
              value={this.state.location}
              onChange={(e) => this.setState({ location: e.target.value })}
              placeholder="City, Country"
            />
          </div>
        </div>
      </Modal>
    );
  }
}
