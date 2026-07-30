import React from "react";
import type { ContactStatus, DealStage, TaskPriority } from "@/types";
import type { AccountStatus } from "@/types/account";
import type {
  WorkflowOverallStatus,
  WorkflowRequestStepStatus,
} from "@/types/workflowRequest";

type Tone = "primary" | "teal" | "amber" | "rose" | "blue" | "gray";

interface BadgeProps {
  tone: Tone;
  children: React.ReactNode;
  dot?: boolean;
}

export class Badge extends React.Component<BadgeProps> {
  render(): React.ReactNode {
    const { tone, children, dot } = this.props;
    return (
      <span className={`badge badge--${tone}`}>
        {dot && <span className="dot" />}
        {children}
      </span>
    );
  }
}

const statusTone: Record<ContactStatus, Tone> = {
  active: "teal",
  lead: "blue",
  inactive: "gray",
};

export class ContactStatusBadge extends React.Component<{ status: ContactStatus }> {
  render(): React.ReactNode {
    const { status } = this.props;
    return (
      <Badge tone={statusTone[status]} dot>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  }
}

const accountStatusTone: Record<AccountStatus, Tone> = {
  Active: "teal",
  Inactive: "gray",
};

export class AccountStatusBadge extends React.Component<{ status: AccountStatus }> {
  render(): React.ReactNode {
    const { status } = this.props;
    return (
      <Badge tone={accountStatusTone[status]} dot>
        {status}
      </Badge>
    );
  }
}

const stageTone: Record<DealStage, Tone> = {
  lead: "gray",
  qualified: "blue",
  proposal: "primary",
  negotiation: "amber",
  won: "teal",
  lost: "rose",
};
const stageLabel: Record<DealStage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export class DealStageBadge extends React.Component<{ stage: DealStage }> {
  render(): React.ReactNode {
    const { stage } = this.props;
    return <Badge tone={stageTone[stage]}>{stageLabel[stage]}</Badge>;
  }
}

const priorityTone: Record<TaskPriority, Tone> = {
  high: "rose",
  medium: "amber",
  low: "gray",
};

export class PriorityBadge extends React.Component<{ priority: TaskPriority }> {
  render(): React.ReactNode {
    const { priority } = this.props;
    return (
      <Badge tone={priorityTone[priority]} dot>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  }
}

const overallStatusTone: Record<WorkflowOverallStatus, Tone> = {
  DRAFT: "gray",
  IN_PROGRESS: "blue",
  APPROVED: "teal",
  REJECTED: "rose",
  CANCELLED: "gray",
  EXPIRED: "amber",
};
const overallStatusLabel: Record<WorkflowOverallStatus, string> = {
  DRAFT: "Draft",
  IN_PROGRESS: "In progress",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export class WorkflowStatusBadge extends React.Component<{ status: WorkflowOverallStatus }> {
  render(): React.ReactNode {
    const { status } = this.props;
    return (
      <Badge tone={overallStatusTone[status]} dot>
        {overallStatusLabel[status]}
      </Badge>
    );
  }
}

const stepStatusTone: Record<WorkflowRequestStepStatus, Tone> = {
  PENDING: "gray",
  ACTIVE: "blue",
  APPROVED: "teal",
  REJECTED: "rose",
  SKIPPED: "gray",
  EXPIRED: "amber",
};
const stepStatusLabel: Record<WorkflowRequestStepStatus, string> = {
  PENDING: "Pending",
  ACTIVE: "Active",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SKIPPED: "Skipped",
  EXPIRED: "Expired",
};

export class StepStatusBadge extends React.Component<{ status: WorkflowRequestStepStatus }> {
  render(): React.ReactNode {
    const { status } = this.props;
    return (
      <Badge tone={stepStatusTone[status]} dot>
        {stepStatusLabel[status]}
      </Badge>
    );
  }
}
