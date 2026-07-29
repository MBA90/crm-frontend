// Types for the "add account" approval workflow — these mirror the crm-account
// AccountDTO and the crm-workflow WorkflowRequestCreateRequest/WorkflowRequestDto
// contracts (POST /api/workflow-requests, POST /api/workflow-requests/{id}/submit).

export type AccountType = "prospect" | "customer" | "partner" | "reseller";
export type AccountSource = "admin_panel" | "import" | "api";
export type EmployeeBand = "1-10" | "11-50" | "51-200" | "201-1000" | "1000+";

export const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "prospect", label: "Prospect" },
  { value: "customer", label: "Customer" },
  { value: "partner", label: "Partner" },
  { value: "reseller", label: "Reseller" },
];

export const ACCOUNT_SOURCES: { value: AccountSource; label: string }[] = [
  { value: "admin_panel", label: "Admin panel" },
  { value: "import", label: "Import" },
  { value: "api", label: "API" },
];

export const EMPLOYEE_BANDS: EmployeeBand[] = [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000+",
];

/** Fields collected on the "new account" form; sent as the workflow request's payload. */
export interface CreateAccountPayload {
  legalName: string;
  tradeName?: string;
  registrationNo: string;
  taxId?: string;
  industry?: string;
  employeeBand?: EmployeeBand;
  country: string;
  city?: string;
  website?: string;
  parentAccountId?: string;
  accountType: AccountType;
  ownerId: string;
  source: AccountSource;
}

export type WorkflowOverallStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED";

export type WorkflowRequestStepStatus =
  | "PENDING"
  | "ACTIVE"
  | "APPROVED"
  | "REJECTED"
  | "SKIPPED"
  | "EXPIRED";

export interface WorkflowRequestStep {
  requestStepId: string;
  stepOrder: number;
  stepName: string;
  approverRole: string;
  approvalType: string;
  quorumCount: number | null;
  assignedTo: string | null;
  delegateTo: string | null;
  status: WorkflowRequestStepStatus;
  decidedBy: string | null;
  deciderName: string | null;
  comment: string | null;
  slaDueAt: string | null;
  escalatedAt: string | null;
  decidedAt: string | null;
}

export interface WorkflowRequest {
  requestId: string;
  definitionId: string;
  entityType: string;
  entityId: string | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  payload: unknown;
  overallStatus: WorkflowOverallStatus;
  currentStep: number | null;
  requestedBy: string;
  requesterName: string | null;
  createdAt: string;
  completedAt: string | null;
  steps: WorkflowRequestStep[];
}
