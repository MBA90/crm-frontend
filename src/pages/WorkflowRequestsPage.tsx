import React from "react";
import { Link } from "react-router-dom";
import { withRouter, type RouterProps } from "@/lib/withRouter";
import { Icon } from "@/components/ui/Icon";
import { WorkflowStatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiError } from "@/lib/apiClient";
import { listWorkflowRequests } from "@/services/workflowRequestsApi";
import { formatDateTime } from "@/lib/format";
import type { WorkflowRequest } from "@/types/workflowRequest";

type Filter = "open" | "approved" | "rejected" | "all";

interface WorkflowRequestsProps {
  router: RouterProps;
}
interface WorkflowRequestsState {
  loading: boolean;
  error: string;
  requests: WorkflowRequest[];
  filter: Filter;
}

/** Best-effort human label for a request's payload, without assuming its shape. */
function summarize(request: WorkflowRequest): string {
  const payload = request.payload;
  if (
    request.entityType === "ACCOUNT" &&
    payload &&
    typeof payload === "object" &&
    "legalName" in (payload as Record<string, unknown>)
  ) {
    return String((payload as Record<string, unknown>).legalName);
  }
  return `${request.entityType} ${request.action.toLowerCase()}`;
}

class WorkflowRequestsBase extends React.Component<
  WorkflowRequestsProps,
  WorkflowRequestsState
> {
  state: WorkflowRequestsState = {
    loading: true,
    error: "",
    requests: [],
    filter: "open",
  };

  componentDidMount(): void {
    void this.load();
  }

  private load = async (): Promise<void> => {
    this.setState({ loading: true, error: "" });
    try {
      const requests = await listWorkflowRequests();
      requests.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      this.setState({ requests, loading: false });
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Failed to load workflow requests.";
      this.setState({ loading: false, error: message });
    }
  };

  private filtered(): WorkflowRequest[] {
    const { requests, filter } = this.state;
    if (filter === "open") {
      return requests.filter(
        (r) => r.overallStatus === "DRAFT" || r.overallStatus === "IN_PROGRESS"
      );
    }
    if (filter === "approved") return requests.filter((r) => r.overallStatus === "APPROVED");
    if (filter === "rejected") {
      return requests.filter((r) =>
        (["REJECTED", "CANCELLED", "EXPIRED"] as const).includes(
          r.overallStatus as "REJECTED" | "CANCELLED" | "EXPIRED"
        )
      );
    }
    return requests;
  }

  render(): React.ReactNode {
    const { navigate } = this.props.router;
    const rows = this.filtered();
    const filters: { key: Filter; label: string }[] = [
      { key: "open", label: "Open" },
      { key: "approved", label: "Approved" },
      { key: "rejected", label: "Rejected" },
      { key: "all", label: "All" },
    ];

    return (
      <>
        <div className="page-head">
          <div>
            <h1>Workflow requests</h1>
            <p>Approval requests submitted through the CRM.</p>
          </div>
          <Link className="btn btn--primary" to="/accounts/new">
            <Icon name="plus" size={16} />
            New account request
          </Link>
        </div>

        <div className="toolbar">
          <div className="seg">
            {filters.map((f) => (
              <button
                key={f.key}
                className={this.state.filter === f.key ? "active" : ""}
                onClick={() => this.setState({ filter: f.key })}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {this.state.error && (
          <div className="auth-error" style={{ marginBottom: 16 }}>
            {this.state.error}
          </div>
        )}

        <div className="card">
          {this.state.loading ? (
            <div className="card__body muted">Loading…</div>
          ) : rows.length === 0 ? (
            <EmptyState
              icon="activity"
              title="No workflow requests"
              message={
                this.state.error
                  ? "Try reloading once the workflow service is reachable."
                  : "Requests you submit will show up here."
              }
              actionLabel="New account request"
              onAction={() => navigate("/accounts/new")}
            />
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Entity</th>
                    <th>Action</th>
                    <th>Status</th>
                    <th>Requested by</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.requestId}
                      onClick={() => navigate(`/workflow-requests/${r.requestId}`)}
                    >
                      <td className="cell-primary">{summarize(r)}</td>
                      <td className="cell-sub">{r.action}</td>
                      <td>
                        <WorkflowStatusBadge status={r.overallStatus} />
                      </td>
                      <td className="cell-sub">{r.requesterName ?? r.requestedBy}</td>
                      <td className="cell-sub">{formatDateTime(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  }
}

export const WorkflowRequestsPage = withRouter(WorkflowRequestsBase);
