import React from "react";
import { Link } from "react-router-dom";
import { withRouter, type RouterProps } from "@/lib/withRouter";
import { Icon } from "@/components/ui/Icon";
import { WorkflowRequestSummary } from "@/components/workflow/WorkflowRequestSummary";
import { toast } from "@/components/ui/Toast";
import { authStore } from "@/auth/AuthStore";
import { ApiError } from "@/lib/apiClient";
import {
  createAccountWorkflowRequest,
  submitWorkflowRequest,
} from "@/services/workflowRequestsApi";
import {
  ACCOUNT_TYPES,
  ACCOUNT_SOURCES,
  EMPLOYEE_BANDS,
  type AccountType,
  type AccountSource,
  type EmployeeBand,
  type WorkflowRequest,
} from "@/types/workflowRequest";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type FieldKey =
  | "legalName"
  | "registrationNo"
  | "country"
  | "accountType"
  | "ownerId"
  | "parentAccountId";

interface FormFields {
  legalName: string;
  tradeName: string;
  registrationNo: string;
  taxId: string;
  industry: string;
  employeeBand: EmployeeBand | "";
  country: string;
  city: string;
  website: string;
  parentAccountId: string;
  accountType: AccountType | "";
  ownerId: string;
  source: AccountSource;
}

interface NewAccountRequestProps {
  router: RouterProps;
}

interface NewAccountRequestState extends FormFields {
  errors: Partial<Record<FieldKey, string>>;
  submitting: boolean;
  submitError: string;
  /** Set once the draft request is created, so a failed submit can be retried
   *  without creating a duplicate draft. */
  draftRequestId: string | null;
  result: WorkflowRequest | null;
}

const emptyForm: FormFields = {
  legalName: "",
  tradeName: "",
  registrationNo: "",
  taxId: "",
  industry: "",
  employeeBand: "",
  country: "",
  city: "",
  website: "",
  parentAccountId: "",
  accountType: "",
  ownerId: "",
  source: "admin_panel",
};

class NewAccountRequestBase extends React.Component<
  NewAccountRequestProps,
  NewAccountRequestState
> {
  state: NewAccountRequestState = {
    ...emptyForm,
    ownerId: authStore.getState().user?.sub ?? "",
    errors: {},
    submitting: false,
    submitError: "",
    draftRequestId: null,
    result: null,
  };

  private setField = <K extends keyof FormFields>(key: K, value: FormFields[K]): void => {
    this.setState({
      [key]: value,
      errors: { ...this.state.errors, [key as string]: undefined },
    } as unknown as Pick<NewAccountRequestState, K>);
  };

  private validate(): Partial<Record<FieldKey, string>> {
    const s = this.state;
    const errors: Partial<Record<FieldKey, string>> = {};
    if (!s.legalName.trim()) errors.legalName = "Legal name is required.";
    if (!s.registrationNo.trim()) errors.registrationNo = "Registration number is required.";
    if (!s.country.trim()) errors.country = "Country is required.";
    if (!s.accountType) errors.accountType = "Account type is required.";
    if (!s.ownerId.trim()) errors.ownerId = "Owner ID is required.";
    else if (!UUID_RE.test(s.ownerId.trim())) errors.ownerId = "Owner ID must be a UUID.";
    if (s.parentAccountId.trim() && !UUID_RE.test(s.parentAccountId.trim())) {
      errors.parentAccountId = "Parent account ID must be a UUID.";
    }
    return errors;
  }

  private buildPayload() {
    const s = this.state;
    const trimOrUndef = (v: string) => (v.trim() ? v.trim() : undefined);
    return {
      legalName: s.legalName.trim(),
      tradeName: trimOrUndef(s.tradeName),
      registrationNo: s.registrationNo.trim(),
      taxId: trimOrUndef(s.taxId),
      industry: trimOrUndef(s.industry),
      employeeBand: s.employeeBand || undefined,
      country: s.country.trim(),
      city: trimOrUndef(s.city),
      website: trimOrUndef(s.website),
      parentAccountId: trimOrUndef(s.parentAccountId),
      accountType: s.accountType as AccountType,
      ownerId: s.ownerId.trim(),
      source: s.source,
    };
  }

  private handleSubmit = async (): Promise<void> => {
    const errors = this.validate();
    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }

    this.setState({ submitting: true, submitError: "" });
    try {
      let requestId = this.state.draftRequestId;
      if (!requestId) {
        const created = await createAccountWorkflowRequest(this.buildPayload());
        requestId = created.requestId;
        this.setState({ draftRequestId: requestId });
      }
      const submitted = await submitWorkflowRequest(requestId);
      this.setState({ submitting: false, result: submitted });
      toast.show("Account request submitted for approval");
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Something went wrong. Please try again.";
      this.setState({ submitting: false, submitError: message });
    }
  };

  private reset = (): void => {
    this.setState({
      ...emptyForm,
      ownerId: authStore.getState().user?.sub ?? "",
      errors: {},
      submitting: false,
      submitError: "",
      draftRequestId: null,
      result: null,
    });
  };

  render(): React.ReactNode {
    const { navigate } = this.props.router;
    const s = this.state;
    const disabled = s.submitting || !!s.result;

    if (s.result) {
      return (
        <>
          <div className="back-link" onClick={() => navigate("/companies")}>
            <Icon name="back" size={15} /> Back to accounts
          </div>

          <div className="page-head">
            <div>
              <h1>Account request submitted</h1>
              <p>
                <Link to="/workflow-requests" style={{ color: "var(--primary)" }}>
                  View all workflow requests
                </Link>
              </p>
            </div>
            <button className="btn btn--primary" onClick={this.reset}>
              <Icon name="plus" size={16} />
              New account request
            </button>
          </div>

          <WorkflowRequestSummary title={s.legalName} request={s.result} />
        </>
      );
    }

    return (
      <>
        <div className="back-link" onClick={() => navigate("/companies")}>
          <Icon name="back" size={15} /> Back to accounts
        </div>

        <div className="page-head">
          <div>
            <h1>New account request</h1>
            <p>Submits an account-creation request for Sales Manager approval.</p>
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <div className="form-grid">
              <div className="field field--full">
                <label>Legal name *</label>
                <input
                  className={s.errors.legalName ? "invalid" : ""}
                  value={s.legalName}
                  onChange={(e) => this.setField("legalName", e.target.value)}
                  disabled={disabled}
                  autoFocus
                />
                {s.errors.legalName && <span className="error-text">{s.errors.legalName}</span>}
              </div>

              <div className="field">
                <label>Trade name</label>
                <input
                  value={s.tradeName}
                  onChange={(e) => this.setField("tradeName", e.target.value)}
                  disabled={disabled}
                />
              </div>

              <div className="field">
                <label>Registration number *</label>
                <input
                  className={s.errors.registrationNo ? "invalid" : ""}
                  value={s.registrationNo}
                  onChange={(e) => this.setField("registrationNo", e.target.value)}
                  disabled={disabled}
                />
                {s.errors.registrationNo && (
                  <span className="error-text">{s.errors.registrationNo}</span>
                )}
              </div>

              <div className="field">
                <label>Tax ID</label>
                <input
                  value={s.taxId}
                  onChange={(e) => this.setField("taxId", e.target.value)}
                  disabled={disabled}
                />
              </div>

              <div className="field">
                <label>Country *</label>
                <input
                  className={s.errors.country ? "invalid" : ""}
                  value={s.country}
                  onChange={(e) => this.setField("country", e.target.value)}
                  placeholder="e.g. Jordan"
                  disabled={disabled}
                />
                {s.errors.country && <span className="error-text">{s.errors.country}</span>}
              </div>

              <div className="field">
                <label>City</label>
                <input
                  value={s.city}
                  onChange={(e) => this.setField("city", e.target.value)}
                  disabled={disabled}
                />
              </div>

              <div className="field">
                <label>Industry</label>
                <input
                  value={s.industry}
                  onChange={(e) => this.setField("industry", e.target.value)}
                  placeholder="e.g. Logistics"
                  disabled={disabled}
                />
              </div>

              <div className="field">
                <label>Employee band</label>
                <select
                  value={s.employeeBand}
                  onChange={(e) =>
                    this.setField("employeeBand", e.target.value as EmployeeBand | "")
                  }
                  disabled={disabled}
                >
                  <option value="">—</option>
                  {EMPLOYEE_BANDS.map((b) => (
                    <option key={b} value={b}>
                      {b} employees
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Website</label>
                <input
                  value={s.website}
                  onChange={(e) => this.setField("website", e.target.value)}
                  placeholder="example.com"
                  disabled={disabled}
                />
              </div>

              <div className="field">
                <label>Parent account ID</label>
                <input
                  className={s.errors.parentAccountId ? "invalid" : ""}
                  value={s.parentAccountId}
                  onChange={(e) => this.setField("parentAccountId", e.target.value)}
                  placeholder="Optional UUID"
                  disabled={disabled}
                />
                {s.errors.parentAccountId && (
                  <span className="error-text">{s.errors.parentAccountId}</span>
                )}
              </div>

              <div className="field">
                <label>Account type *</label>
                <select
                  className={s.errors.accountType ? "invalid" : ""}
                  value={s.accountType}
                  onChange={(e) =>
                    this.setField("accountType", e.target.value as AccountType | "")
                  }
                  disabled={disabled}
                >
                  <option value="">Select…</option>
                  {ACCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {s.errors.accountType && (
                  <span className="error-text">{s.errors.accountType}</span>
                )}
              </div>

              <div className="field">
                <label>Source</label>
                <select
                  value={s.source}
                  onChange={(e) => this.setField("source", e.target.value as AccountSource)}
                  disabled={disabled}
                >
                  {ACCOUNT_SOURCES.map((src) => (
                    <option key={src.value} value={src.value}>
                      {src.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field field--full">
                <label>Owner ID *</label>
                <input
                  className={s.errors.ownerId ? "invalid" : ""}
                  value={s.ownerId}
                  onChange={(e) => this.setField("ownerId", e.target.value)}
                  disabled={disabled}
                />
                <span className="hint">
                  Keycloak subject (UUID) of the sales rep who owns this account. Defaults to you.
                </span>
                {s.errors.ownerId && <span className="error-text">{s.errors.ownerId}</span>}
              </div>
            </div>

            {s.submitError && (
              <div className="auth-error" style={{ marginTop: 18 }}>
                {s.submitError}
                {s.draftRequestId && " Your draft was saved — resubmitting will retry the same request."}
              </div>
            )}
          </div>

          <div className="modal__foot">
            <button
              className="btn btn--ghost"
              onClick={() => navigate("/companies")}
              disabled={s.submitting}
            >
              Cancel
            </button>
            <button
              className="btn btn--primary"
              onClick={this.handleSubmit}
              disabled={s.submitting}
            >
              {s.submitting ? "Submitting…" : "Submit for approval"}
            </button>
          </div>
        </div>
      </>
    );
  }
}

export const NewAccountRequestPage = withRouter(NewAccountRequestBase);
