import { authStore } from "@/auth/AuthStore";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8100"
).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  detail?: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function readError(res: Response): Promise<{ message: string; detail?: unknown }> {
  try {
    const body = await res.json();
    const message =
      (typeof body?.message === "string" && body.message) ||
      (typeof body?.error === "string" && body.error) ||
      res.statusText ||
      `Request failed (${res.status})`;
    return { message, detail: body };
  } catch {
    return { message: res.statusText || `Request failed (${res.status})` };
  }
}

/** Authorized JSON fetch against the crm-gateway; attaches the Keycloak bearer token. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await authStore.getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const { message, detail } = await readError(res);
    throw new ApiError(message, res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
