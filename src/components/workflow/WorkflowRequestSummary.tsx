import React from "react";
import { WorkflowStatusBadge, StepStatusBadge } from "@/components/ui/Badge";
import { renderPayloadFields } from "@/components/workflow/payloadFields";
import { formatDateTime } from "@/lib/format";
import type { WorkflowRequest, WorkflowRequestStep } from "@/types/workflowRequest";

interface WorkflowRequestSummaryProps {
  title: string;
  request: WorkflowRequest;
  /** When provided, an ACTIVE step renders Approve/Reject controls that call this. */
  onDecide?: (step: WorkflowRequestStep, approved: boolean, comment: string) => void;
  /** requestStepId currently being decided, to disable its controls mid-flight. */
  decidingStepId?: string | null;
}

interface WorkflowRequestSummaryState {
  comments: Record<string, string>;
}

export class WorkflowRequestSummary extends React.Component<
  WorkflowRequestSummaryProps,
  WorkflowRequestSummaryState
> {
  state: WorkflowRequestSummaryState = { comments: {} };

  private setComment(stepId: string, value: string): void {
    this.setState({ comments: { ...this.state.comments, [stepId]: value } });
  }

  render(): React.ReactNode {
    const { title, request, onDecide, decidingStepId } = this.props;
    return (
      <div className="card">
        <div className="card__head">
          <h3>{title}</h3>
          <WorkflowStatusBadge status={request.overallStatus} />
        </div>
        <div className="card__body">
          <dl className="kv">
            <dt>Request ID</dt>
            <dd className="mono">{request.requestId}</dd>
            <dt>Requested by</dt>
            <dd>{request.requesterName ?? request.requestedBy}</dd>
            <dt>Submitted</dt>
            <dd>{formatDateTime(request.createdAt)}</dd>
            {request.completedAt && (
              <>
                <dt>Completed</dt>
                <dd>{formatDateTime(request.completedAt)}</dd>
              </>
            )}
          </dl>

          <div className="divider" />
          <div className="section-title">{request.entityType} details</div>
          {renderPayloadFields(request.entityType, request.payload)}

          {request.steps.length > 0 && (
            <>
              <div className="divider" />
              <div className="section-title">Approval steps</div>
              <div style={{ display: "grid", gap: 8 }}>
                {request.steps.map((step) => {
                  const deciding = decidingStepId === step.requestStepId;
                  const showDecide = !!onDecide && step.status === "ACTIVE";
                  return (
                    <div
                      key={step.requestStepId}
                      style={{
                        padding: "10px 12px",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <div>
                          <div className="cell-primary">
                            {step.stepOrder}. {step.stepName}
                          </div>
                          <div className="cell-sub">
                            {step.approverRole}
                            {step.slaDueAt ? ` · SLA due ${formatDateTime(step.slaDueAt)}` : ""}
                            {step.deciderName ? ` · Decided by ${step.deciderName}` : ""}
                          </div>
                        </div>
                        <StepStatusBadge status={step.status} />
                      </div>
                      {step.comment && (
                        <div className="cell-sub" style={{ marginTop: 8 }}>
                          “{step.comment}”
                        </div>
                      )}
                      {showDecide && (
                        <div style={{ marginTop: 10 }}>
                          <div className="field">
                            <textarea
                              placeholder="Optional comment"
                              value={this.state.comments[step.requestStepId] ?? ""}
                              onChange={(e) =>
                                this.setComment(step.requestStepId, e.target.value)
                              }
                              disabled={deciding}
                            />
                          </div>
                          <div
                            className="row"
                            style={{ marginTop: 8, justifyContent: "flex-end" }}
                          >
                            <button
                              className="btn btn--danger btn--sm"
                              disabled={deciding}
                              onClick={() =>
                                onDecide!(
                                  step,
                                  false,
                                  this.state.comments[step.requestStepId] ?? ""
                                )
                              }
                            >
                              Reject
                            </button>
                            <button
                              className="btn btn--primary btn--sm"
                              disabled={deciding}
                              onClick={() =>
                                onDecide!(
                                  step,
                                  true,
                                  this.state.comments[step.requestStepId] ?? ""
                                )
                              }
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
}
