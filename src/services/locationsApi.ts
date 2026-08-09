import { apiFetch } from "@/lib/apiClient";
import type { Country, State } from "@/types/location";

// Routed through crm-gateway (/services/mastersetup/** -> crm-master-setup, StripPrefix=2)
// to crm-master-setup's `/api/v1/locations` controller.
const BASE_PATH = "/services/mastersetup/api/v1/locations";

/** GET /api/v1/locations/countries — full country reference list. */
export function listCountries(signal?: AbortSignal): Promise<Country[]> {
  return apiFetch<Country[]>(`${BASE_PATH}/countries`, { signal });
}

/** GET /api/v1/locations/countries/{countryCodeIso2}/states — states/cities of a country. */
export function listStates(
  countryCodeIso2: string,
  signal?: AbortSignal
): Promise<State[]> {
  return apiFetch<State[]>(
    `${BASE_PATH}/countries/${encodeURIComponent(countryCodeIso2)}/states`,
    { signal }
  );
}