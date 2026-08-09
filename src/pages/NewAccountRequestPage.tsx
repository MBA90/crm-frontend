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
import { listCountries, listStates } from "@/services/locationsApi";
import type { Country, State } from "@/types/location";
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

const isAbort = (e: unknown): boolean => e instanceof DOMException && e.name === "AbortError";

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
  /** Country *name* — what the account service stores. */
  country: string;
  /** ISO-3166 alpha-2 of the selected country; drives the states lookup only. */
  countryIso2: string;
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
  countries: Country[];
  states: State[];
  loadingCountries: boolean;
  loadingStates: boolean;
  /** Non-empty when the master-setup lookup fails; the field degrades to free text. */
  countriesError: string;
  statesError: string;
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
  countryIso2: "",
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
    countries: [],
    states: [],
    loadingCountries: true,
    loadingStates: false,
    countriesError: "",
    statesError: "",
    submitting: false,
    submitError: "",
    draftRequestId: null,
    result: null,
  };

  private countriesAbort: AbortController | null = null;
  private statesAbort: AbortController | null = null;

  componentDidMount(): void {
    void this.loadCountries();
  }

  componentWillUnmount(): void {
    this.countriesAbort?.abort();
    this.statesAbort?.abort();
  }

  private async loadCountries(): Promise<void> {
    // A fresh controller per call: StrictMode mounts, unmounts, then re-mounts in dev,
    // and a controller reused across that cycle would already be aborted.
    this.countriesAbort?.abort();
    const abort = new AbortController();
    this.countriesAbort = abort;
    this.setState({ loadingCountries: true, countriesError: "" });
    try {
      const countries = await listCountries(abort.signal);
      countries.sort((a, b) => a.name.localeCompare(b.name));
      this.setState({ countries, loadingCountries: false, countriesError: "" });
    } catch (e) {
      if (isAbort(e)) return;
      this.setState({
        loadingCountries: false,
        countriesError:
          e instanceof ApiError ? e.message : "Could not load the country list.",
      });
    }
  }

  private async loadStates(countryIso2: string): Promise<void> {
    this.statesAbort?.abort();
    const abort = new AbortController();
    this.statesAbort = abort;
    this.setState({ loadingStates: true, statesError: "", states: [] });
    try {
      const states = await listStates(countryIso2, abort.signal);
      states.sort((a, b) => a.name.localeCompare(b.name));
      this.setState({ states, loadingStates: false });
    } catch (e) {
      if (isAbort(e)) return;
      this.setState({
        loadingStates: false,
        statesError: e instanceof ApiError ? e.message : "Could not load the city list.",
      });
    }
  }

  /** Selecting a country records its name (what gets submitted) and reloads the cities. */
  private handleCountryChange = (iso2: string): void => {
    const country = this.state.countries.find((c) => c.iso2 === iso2);
    this.setState({
      countryIso2: iso2,
      country: country?.name ?? "",
      city: "",
      states: [],
      statesError: "",
      errors: { ...this.state.errors, country: undefined },
    });
    if (iso2) void this.loadStates(iso2);
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
    this.statesAbort?.abort();
    this.setState({
      ...emptyForm,
      ownerId: authStore.getState().user?.sub ?? "",
      errors: {},
      states: [],
      loadingStates: false,
      statesError: "",
      submitting: false,
      submitError: "",
      draftRequestId: null,
      result: null,
    });
  };

  /** Cities come from the selected country's states; falls back to free text when the
   *  lookup fails or the country has no states on record. */
  private renderCityField(disabled: boolean): React.ReactNode {
    const s = this.state;
    const freeText = !!s.countriesError || !!s.statesError;

    if (freeText) {
      return (
        <>
          <input
            value={s.city}
            onChange={(e) => this.setField("city", e.target.value)}
            disabled={disabled}
          />
          {s.statesError && (
            <span className="hint">{s.statesError} Enter the city manually.</span>
          )}
        </>
      );
    }

    const noStates = !!s.countryIso2 && !s.loadingStates && s.states.length === 0;
    if (noStates) {
      return (
        <input
          value={s.city}
          onChange={(e) => this.setField("city", e.target.value)}
          disabled={disabled}
        />
      );
    }

    let placeholder = "Select…";
    if (!s.countryIso2) placeholder = "Select a country first";
    else if (s.loadingStates) placeholder = "Loading cities…";

    return (
      <select
        value={s.city}
        onChange={(e) => this.setField("city", e.target.value)}
        disabled={disabled || !s.countryIso2 || s.loadingStates}
      >
        <option value="">{placeholder}</option>
        {s.states.map((st) => (
          <option key={st.id} value={st.name}>
            {st.name}
          </option>
        ))}
      </select>
    );
  }

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
                {s.countriesError ? (
                  <input
                    className={s.errors.country ? "invalid" : ""}
                    value={s.country}
                    onChange={(e) => this.setField("country", e.target.value)}
                    placeholder="e.g. Jordan"
                    disabled={disabled}
                  />
                ) : (
                  <select
                    className={s.errors.country ? "invalid" : ""}
                    value={s.countryIso2}
                    onChange={(e) => this.handleCountryChange(e.target.value)}
                    disabled={disabled || s.loadingCountries}
                  >
                    <option value="">
                      {s.loadingCountries ? "Loading countries…" : "Select…"}
                    </option>
                    {s.countries.map((c) => (
                      <option key={c.iso2} value={c.iso2}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
                {s.countriesError && (
                  <span className="hint">{s.countriesError} Enter the country manually.</span>
                )}
                {s.errors.country && <span className="error-text">{s.errors.country}</span>}
              </div>

              <div className="field">
                <label>City</label>
                {this.renderCityField(disabled)}
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
