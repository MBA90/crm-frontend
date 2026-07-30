import React from "react";
import { Link } from "react-router-dom";
import { withRouter, type RouterProps } from "@/lib/withRouter";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { AccountStatusBadge } from "@/components/ui/Badge";
import { AccountDetailsDialog } from "@/components/accounts/AccountDetailsDialog";
import { ApiError } from "@/lib/apiClient";
import { searchAccounts } from "@/services/accountsApi";
import { EMPLOYEE_BANDS } from "@/types/workflowRequest";
import { ACCOUNT_STATUSES, type AccountDTO, type AccountStatus, type EmployeeBand } from "@/types/account";

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

interface Filters {
  legalName: string;
  tradeName: string;
  registrationNo: string;
  status: AccountStatus | "";
  employeeBand: EmployeeBand | "";
}

const EMPTY_FILTERS: Filters = {
  legalName: "",
  tradeName: "",
  registrationNo: "",
  status: "",
  employeeBand: "",
};

interface CompaniesProps {
  router: RouterProps;
}
interface CompaniesState extends Filters {
  page: number;
  size: number;
  accounts: AccountDTO[];
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: string | null;
  viewing: AccountDTO | null;
}

class CompaniesBase extends React.Component<CompaniesProps, CompaniesState> {
  state: CompaniesState = {
    ...EMPTY_FILTERS,
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    accounts: [],
    totalPages: 0,
    totalElements: 0,
    loading: false,
    error: null,
    viewing: null,
  };

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;
  private abortController: AbortController | null = null;

  componentDidMount(): void {
    this.fetchAccounts(0);
  }

  componentWillUnmount(): void {
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.abortController?.abort();
  }

  private fetchAccounts = async (page: number): Promise<void> => {
    this.abortController?.abort();
    const controller = new AbortController();
    this.abortController = controller;

    const { legalName, tradeName, registrationNo, status, employeeBand, size } = this.state;
    this.setState({ loading: true, error: null });
    try {
      const result = await searchAccounts({
        legalName,
        tradeName,
        registrationNo,
        status,
        employeeBand,
        page,
        size,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      this.setState({
        accounts: result.content,
        page: result.number,
        totalPages: result.totalPages,
        totalElements: result.totalElements,
        loading: false,
      });
    } catch (e) {
      if (controller.signal.aborted) return;
      const message = e instanceof ApiError ? e.message : "Couldn't load accounts. Try again.";
      this.setState({ loading: false, error: message });
    }
  };

  private handleTextFilterChange = (key: "legalName" | "tradeName" | "registrationNo", value: string): void => {
    this.setState({ [key]: value } as Pick<CompaniesState, typeof key>);
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.fetchAccounts(0), SEARCH_DEBOUNCE_MS);
  };

  private handleSelectFilterChange = (key: "status" | "employeeBand", value: string): void => {
    this.setState({ [key]: value } as Pick<CompaniesState, typeof key>, () => this.fetchAccounts(0));
  };

  private clearFilters = (): void => {
    this.setState(EMPTY_FILTERS, () => this.fetchAccounts(0));
  };

  private handlePageChange = (page: number): void => {
    this.fetchAccounts(page);
  };

  private handlePageSizeChange = (size: number): void => {
    this.setState({ size }, () => this.fetchAccounts(0));
  };

  render(): React.ReactNode {
    const { navigate } = this.props.router;
    const {
      accounts,
      legalName,
      tradeName,
      registrationNo,
      status,
      employeeBand,
      loading,
      error,
      page,
      size,
      totalPages,
      totalElements,
    } = this.state;
    const hasFilters = Boolean(legalName || tradeName || registrationNo || status || employeeBand);

    return (
      <>
        <div className="page-head">
          <div>
            <h1>Accounts</h1>
            <p>{totalElements} accounts in your workspace.</p>
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
              placeholder="Search by legal name…"
              value={legalName}
              onChange={(e) => this.handleTextFilterChange("legalName", e.target.value)}
            />
          </div>
          <div className="field" style={{ width: 160 }}>
            <input
              placeholder="Trade name"
              value={tradeName}
              onChange={(e) => this.handleTextFilterChange("tradeName", e.target.value)}
            />
          </div>
          <div className="field" style={{ width: 160 }}>
            <input
              placeholder="Registration no."
              value={registrationNo}
              onChange={(e) => this.handleTextFilterChange("registrationNo", e.target.value)}
            />
          </div>
          <div className="field" style={{ width: 140 }}>
            <select
              value={status}
              onChange={(e) => this.handleSelectFilterChange("status", e.target.value)}
            >
              <option value="">All statuses</option>
              {ACCOUNT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ width: 140 }}>
            <select
              value={employeeBand}
              onChange={(e) => this.handleSelectFilterChange("employeeBand", e.target.value)}
            >
              <option value="">Any size</option>
              {EMPLOYEE_BANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          {hasFilters && (
            <button className="btn btn--ghost btn--sm" onClick={this.clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="card">
          {accounts.length === 0 ? (
            loading ? (
              <div className="card__body muted">Loading accounts…</div>
            ) : (
              <EmptyState
                icon="companies"
                title="No accounts found"
                message={
                  hasFilters
                    ? "Try adjusting your search or filters."
                    : "Submit an account request to get your first account approved."
                }
                actionLabel="New account request"
                onAction={() => navigate("/accounts/new")}
              />
            )
          ) : (
            <div className="table-wrap" style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.14s ease" }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>Legal name</th>
                    <th>Trade name</th>
                    <th>Registration no.</th>
                    <th>Industry</th>
                    <th>Employee band</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((co) => {
                    const location = [co.city, co.country].filter(Boolean).join(", ");
                    return (
                      <tr key={co.accountId}>
                        <td className="cell-primary">{co.legalName}</td>
                        <td className="cell-sub">{co.tradeName || "—"}</td>
                        <td className="cell-sub cell-num">{co.registrationNo}</td>
                        <td className="cell-sub">{co.industry || "—"}</td>
                        <td className="cell-sub">{co.employeeBand || "—"}</td>
                        <td className="cell-sub">{location || "—"}</td>
                        <td>{co.status ? <AccountStatusBadge status={co.status} /> : "—"}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-btn"
                              aria-label="View account"
                              onClick={() => this.setState({ viewing: co })}
                            >
                              <Icon name="eye" size={16} />
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

        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={size}
          onPageChange={this.handlePageChange}
          onPageSizeChange={this.handlePageSizeChange}
          disabled={loading}
        />

        {this.state.viewing && (
          <AccountDetailsDialog
            account={this.state.viewing}
            onClose={() => this.setState({ viewing: null })}
          />
        )}
      </>
    );
  }
}

export const CompaniesPage = withRouter(CompaniesBase);
