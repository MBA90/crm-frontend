import { apiFetch } from "@/lib/apiClient";
import type { AccountDTO, AccountStatus, EmployeeBand } from "@/types/account";

// Routed through crm-gateway (/services/account/** -> crm-account, StripPrefix=2)
// to crm-account's `/api/accounts` controller.
const BASE_PATH = "/services/account/api/accounts";

/** Spring Data `Page<T>` response shape. */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/** Mirrors crm-account's PageRequestDTO. */
export interface PageRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "ASC" | "DESC";
}

/** Mirrors crm-account's AccountSearchCriteriaDTO; null/blank filter fields are ignored server-side. */
export interface AccountSearchCriteria {
  status?: AccountStatus;
  legalName?: string;
  tradeName?: string;
  registrationNo?: string;
  employeeBand?: EmployeeBand;
  page?: PageRequest;
}

export interface SearchAccountsParams {
  status?: AccountStatus | "";
  legalName?: string;
  tradeName?: string;
  registrationNo?: string;
  employeeBand?: EmployeeBand | "";
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

/** POST /api/accounts/search — filterable, paginated account listing. */
export function searchAccounts({
  status,
  legalName,
  tradeName,
  registrationNo,
  employeeBand,
  page = 0,
  size = 20,
  signal,
}: SearchAccountsParams = {}): Promise<Page<AccountDTO>> {
  const criteria: AccountSearchCriteria = { page: { page, size } };
  if (status) criteria.status = status;
  if (legalName?.trim()) criteria.legalName = legalName.trim();
  if (tradeName?.trim()) criteria.tradeName = tradeName.trim();
  if (registrationNo?.trim()) criteria.registrationNo = registrationNo.trim();
  if (employeeBand) criteria.employeeBand = employeeBand;
  return apiFetch<Page<AccountDTO>>(`${BASE_PATH}/search`, {
    method: "POST",
    body: JSON.stringify(criteria),
    signal,
  });
}
