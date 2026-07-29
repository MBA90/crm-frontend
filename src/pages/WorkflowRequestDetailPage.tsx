import React from "react";
import { withRouter, type RouterProps } from "@/lib/withRouter";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { WorkflowRequestSummary } from "@/components/workflow/WorkflowRequestSummary";
import { toast } from "@/components/ui/Toast";
import { authStore } from "@/auth/AuthStore";
import { ApiError } from "@/lib/apiClient";
import {
  decideWorkflowRequestStep,
  getWorkflowRequest,
} from "@/services/workflowRequestsApi";
import type { WorkflowRequest, WorkflowRequestStep } from "@/types/workflowRequest";

const SALES_MANAGER_ROLE = "SALES_MANAGER";

interface WorkflowRequestDetailProps {
  router: RouterProps;
}
interface WorkflowRequestDetailState {
  loading: boolean;
  error: string;
  request: WorkflowRequest | null;
  decidingStepId: string | null;
}

class WorkflowRequestDetailBase extends React.Component<
  WorkflowRequestDetailProps,
  WorkflowRequestDetailState
> {
  state: WorkflowRequestDetailState = {
    loading: true,
    error: "",
    request: null,
    decidingStepId: null,
  };

  componentDidMount(): void {
    void this.load();
  }

  private load = async (): Promise<void> => {
    debugger;
    const { id } = this.props.router.params;
    if (!id) return;
    this.setState({ loading: true, error: "" });
    try {
      const request = await getWorkflowRequest(id);
      this.setState({ request, loading: false });
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Failed to load this request.";
      this.setState({ loading: false, error: message });
    }
  };

  private handleDecide = async (
    step: WorkflowRequestStep,
    approved: boolean,
    comment: string
  ): Promise<void> => {
    this.setState({ decidingStepId: step.requestStepId });
    try {
      const request = await decideWorkflowRequestStep(step.requestStepId, approved, comment);
      this.setState({ request, decidingStepId: null });
      toast.show(approved ? "Step approved" : "Step rejected");
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Failed to record decision.";
      this.setState({ decidingStepId: null });
      toast.show(message);
    }
  };

  render(): React.ReactNode {
    const { navigate } = this.props.router;
    const { loading, error, request, decidingStepId } = this.state;
    const canDecide = authStore.getState().user?.roles.includes(SALES_MANAGER_ROLE) ?? false;

    return (
      <>
        <div className="back-link" onClick={() => navigate("/workflow-requests")}>
          <Icon name="back" size={15} /> Back to workflow requests
        </div>

        {loading && (
          <div className="card">
            <div className="card__body muted">Loading…</div>
          </div>
        )}

        {!loading && error && (
          <div className="card">
            <EmptyState
              icon="activity"
              title="Couldn't load this request"
              message={error}
              actionLabel="Back to workflow requests"
              onAction={() => navigate("/workflow-requests")}
            />
          </div>
        )}

        {!loading && !error && request && (
          <WorkflowRequestSummary
            title={`${request.entityType} · ${request.action}`}
            request={request}
            onDecide={canDecide ? this.handleDecide : undefined}
            decidingStepId={decidingStepId}
          />
        )}
      </>
    );
  }
}

export const WorkflowRequestDetailPage = withRouter(WorkflowRequestDetailBase);
