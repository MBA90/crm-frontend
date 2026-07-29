import { apiFetch } from "@/lib/apiClient";
import type {
  CreateAccountPayload,
  WorkflowOverallStatus,
  WorkflowRequest,
} from "@/types/workflowRequest";

// Routed through crm-gateway (/services/workflow/** -> crm-workflow, StripPrefix=2)
// to crm-workflow's `/api/workflow-requests` controller.
const BASE_PATH = "/services/workflow/api/workflow-requests";

const ALL_STATUSES: WorkflowOverallStatus[] = [
  "DRAFT",
  "IN_PROGRESS",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "EXPIRED",
];

/** POST /api/workflow-requests — creates a DRAFT account-creation request. */
export function createAccountWorkflowRequest(
  payload: CreateAccountPayload
): Promise<WorkflowRequest> {
  return apiFetch<WorkflowRequest>(BASE_PATH, {
    method: "POST",
    body: JSON.stringify({
      entityType: "ACCOUNT",
      entityId: null,
      action: "CREATE",
      payload,
    }),
  });
}

/** POST /api/workflow-requests/{requestId}/submit — moves a DRAFT request into approval. */
export function submitWorkflowRequest(requestId: string): Promise<WorkflowRequest> {
  return apiFetch<WorkflowRequest>(
    `${BASE_PATH}/${encodeURIComponent(requestId)}/submit`,
    { method: "POST" }
  );
}

/** GET /api/workflow-requests?statuses=... — lists requests across the given statuses. */
export function listWorkflowRequests(
  statuses: WorkflowOverallStatus[] = ALL_STATUSES
): Promise<WorkflowRequest[]> {
  const params = new URLSearchParams();
  statuses.forEach((status) => params.append("statuses", status));
  return apiFetch<WorkflowRequest[]>(`${BASE_PATH}?${params.toString()}`);
}

/** GET /api/workflow-requests/{requestId} — fetches a single request. */
export function getWorkflowRequest(requestId: string): Promise<WorkflowRequest> {
  return apiFetch<WorkflowRequest>(`${BASE_PATH}/${encodeURIComponent(requestId)}`);
}

/** POST /api/workflow-requests/steps/{requestStepId}/decide — approve or reject a step. */
export function decideWorkflowRequestStep(
  requestStepId: string,
  approved: boolean,
  comment?: string
): Promise<WorkflowRequest> {
  return apiFetch<WorkflowRequest>(
    `${BASE_PATH}/steps/${encodeURIComponent(requestStepId)}/decide`,
    {
      method: "POST",
      body: JSON.stringify({
        approved,
        comment: comment?.trim() ? comment.trim() : undefined,
      }),
    }
  );
}
