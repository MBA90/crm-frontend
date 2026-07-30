import React from "react";
import { Modal } from "@/components/ui/Modal";
import { AccountStatusBadge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/format";
import { ACCOUNT_TYPES, ACCOUNT_SOURCES } from "@/types/workflowRequest";
import type { AccountDTO } from "@/types/account";

interface AccountDetailsDialogProps {
  account: AccountDTO;
  onClose: () => void;
}

export class AccountDetailsDialog extends React.Component<AccountDetailsDialogProps> {
  render(): React.ReactNode {
    const a = this.props.account;
    const accountType =
      ACCOUNT_TYPES.find((t) => t.value === a.accountType)?.label ?? a.accountType;
    const source = ACCOUNT_SOURCES.find((s) => s.value === a.source)?.label ?? a.source;

    return (
      <Modal title={a.legalName} onClose={this.props.onClose} wide>
        <dl className="kv">
          <dt>Account ID</dt>
          <dd className="mono">{a.accountId}</dd>

          <dt>Trade name</dt>
          <dd>{a.tradeName || "—"}</dd>

          <dt>Registration no.</dt>
          <dd>{a.registrationNo}</dd>

          <dt>Tax ID</dt>
          <dd>{a.taxId || "—"}</dd>

          <dt>Industry</dt>
          <dd>{a.industry || "—"}</dd>

          <dt>Employee band</dt>
          <dd>{a.employeeBand || "—"}</dd>

          <dt>Country</dt>
          <dd>{a.country}</dd>

          <dt>City</dt>
          <dd>{a.city || "—"}</dd>

          <dt>Website</dt>
          <dd>{a.website || "—"}</dd>

          <dt>Parent account ID</dt>
          <dd className="mono">{a.parentAccountId || "—"}</dd>

          <dt>Account type</dt>
          <dd>{accountType}</dd>

          <dt>Owner ID</dt>
          <dd className="mono">{a.ownerId}</dd>

          <dt>Source</dt>
          <dd>{source}</dd>

          <dt>Status</dt>
          <dd>{a.status ? <AccountStatusBadge status={a.status} /> : "—"}</dd>

          <dt>Created</dt>
          <dd>{formatDateTime(a.createdAt)}</dd>

          <dt>Updated</dt>
          <dd>{formatDateTime(a.updatedAt)}</dd>

          {a.deactivatedAt && (
            <>
              <dt>Deactivated</dt>
              <dd>{formatDateTime(a.deactivatedAt)}</dd>
            </>
          )}

          {a.erasedAt && (
            <>
              <dt>Erased</dt>
              <dd>{formatDateTime(a.erasedAt)}</dd>
            </>
          )}
        </dl>
      </Modal>
    );
  }
}
