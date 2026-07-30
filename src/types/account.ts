import type { AccountSource, AccountType, EmployeeBand } from "@/types/workflowRequest";

export type { AccountSource, AccountType, EmployeeBand };

export type AccountStatus = "Active" | "Inactive";

export const ACCOUNT_STATUSES: AccountStatus[] = ["Active", "Inactive"];

/** Mirrors crm-account's AccountDTO. */
export interface AccountDTO {
  accountId: string;
  legalName: string;
  tradeName: string | null;
  registrationNo: string;
  taxId: string | null;
  industry: string | null;
  employeeBand: EmployeeBand | null;
  country: string;
  city: string | null;
  website: string | null;
  parentAccountId: string | null;
  accountType: AccountType;
  ownerId: string;
  source: AccountSource;
  status: AccountStatus | null;
  createdAt: string;
  updatedAt: string;
  deactivatedAt: string | null;
  erasedAt: string | null;
}
