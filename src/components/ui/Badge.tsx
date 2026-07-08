import React from "react";
import type { ContactStatus, DealStage, TaskPriority } from "@/types";

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
