import React from "react";
import { ACCOUNT_TYPES, ACCOUNT_SOURCES } from "@/types/workflowRequest";

type PayloadRecord = Record<string, unknown>;

function isPayloadRecord(value: unknown): value is PayloadRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** "registrationNo" / "registration_no" -> "Registration no"; common IDs get uppercased. */
function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ");
  const label = spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
  return label.replace(/\b(id|sla|url)\b/gi, (m) => m.toUpperCase());
}

function formatPayloadValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.map(String).join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

interface PayloadField {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}

/** Curated, ordered field list for entity types whose payload shape we know. */
const KNOWN_FIELDS: Record<string, PayloadField[]> = {
  ACCOUNT: [
    { key: "legalName", label: "Legal name" },
    { key: "tradeName", label: "Trade name" },
    { key: "registrationNo", label: "Registration no." },
    { key: "taxId", label: "Tax ID" },
    { key: "industry", label: "Industry" },
    { key: "employeeBand", label: "Employees" },
    { key: "country", label: "Country" },
    { key: "city", label: "City" },
    { key: "website", label: "Website" },
    { key: "parentAccountId", label: "Parent account ID" },
    {
      key: "accountType",
      label: "Account type",
      format: (v) => ACCOUNT_TYPES.find((t) => t.value === v)?.label ?? formatPayloadValue(v),
    },
    { key: "ownerId", label: "Owner ID" },
    {
      key: "source",
      label: "Source",
      format: (v) => ACCOUNT_SOURCES.find((t) => t.value === v)?.label ?? formatPayloadValue(v),
    },
  ],
};

/**
 * Renders a workflow request's payload as labeled fields. Entity types with a
 * known shape (currently ACCOUNT) get curated labels/ordering; anything else
 * (DEAL, REFUND, future types) falls back to listing whatever keys the
 * payload actually has — the engine is payload-agnostic, so the UI must be too.
 */
export function renderPayloadFields(entityType: string, payload: unknown): React.ReactNode {
  if (!isPayloadRecord(payload)) {
    return <span className="muted">No payload data.</span>;
  }

  const known = KNOWN_FIELDS[entityType];
  const fields = known
    ? known.map((f) => ({
        label: f.label,
        value: f.format ? f.format(payload[f.key]) : formatPayloadValue(payload[f.key]),
      }))
    : Object.entries(payload).map(([key, value]) => ({
        label: humanizeKey(key),
        value: formatPayloadValue(value),
      }));

  if (fields.length === 0) {
    return <span className="muted">No payload data.</span>;
  }

  return (
    <dl className="kv">
      {fields.map((f) => (
        <React.Fragment key={f.label}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
