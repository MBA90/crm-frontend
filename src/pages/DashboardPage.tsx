import React from "react";
import { StoreComponent } from "@/store/StoreComponent";
import { withRouter, type RouterProps } from "@/lib/withRouter";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { PriorityBadge } from "@/components/ui/Badge";
import {
  formatCompact,
  formatCurrency,
  fullName,
  initials,
  relativeTime,
  formatDate,
} from "@/lib/format";
import { DEAL_STAGES, PIPELINE_STAGES } from "@/types";
import type { ActivityKind, DealStage } from "@/types";

const OPEN_STAGES: DealStage[] = ["lead", "qualified", "proposal", "negotiation"];

const STAGE_COLOR: Record<DealStage, string> = {
  lead: "#838ba1",
  qualified: "#2f6fed",
  proposal: "#4b44e0",
  negotiation: "#b8790a",
  won: "#0e9488",
  lost: "#d43f45",
};

const ACTIVITY_ICON: Record<ActivityKind, { icon: IconName; bg: string; fg: string }> = {
  deal: { icon: "deals", bg: "var(--primary-soft)", fg: "var(--primary-ink)" },
  contact: { icon: "user", bg: "var(--blue-soft)", fg: "var(--blue)" },
  task: { icon: "check", bg: "var(--teal-soft)", fg: "var(--teal)" },
  company: { icon: "companies", bg: "var(--amber-soft)", fg: "var(--amber)" },
};

interface DashboardProps {
  router: RouterProps;
}

class DashboardBase extends StoreComponent<DashboardProps> {
  render(): React.ReactNode {
    const { navigate } = this.props.router;
    const { deals, contacts, activities, tasks } = this.store.getState();

    const openDeals = deals.filter((d) => OPEN_STAGES.includes(d.stage));
    const wonDeals = deals.filter((d) => d.stage === "won");
    const lostDeals = deals.filter((d) => d.stage === "lost");

    const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);
    const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0);
    const forecast = openDeals.reduce(
      (sum, d) => sum + (d.value * d.probability) / 100,
      0
    );
    const decided = wonDeals.length + lostDeals.length;
    const winRate = decided ? Math.round((wonDeals.length / decided) * 100) : 0;
    const activeContacts = contacts.filter((c) => c.status === "active").length;

    const stageStats = PIPELINE_STAGES.map((stage) => {
      const inStage = deals.filter((d) => d.stage === stage);
      return {
        stage,
        label: DEAL_STAGES.find((s) => s.key === stage)?.label ?? stage,
        count: inStage.length,
        value: inStage.reduce((sum, d) => sum + d.value, 0),
      };
    });
    const maxStageValue = Math.max(1, ...stageStats.map((s) => s.value));

    const upcoming = [...tasks]
      .filter((t) => !t.done)
      .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
      .slice(0, 5);

    const stats: {
      label: string;
      value: string;
      icon: IconName;
      bg: string;
      fg: string;
      meta: React.ReactNode;
    }[] = [
      {
        label: "Open pipeline",
        value: formatCurrency(pipelineValue),
        icon: "deals",
        bg: "var(--primary-soft)",
        fg: "var(--primary-ink)",
        meta: (
          <span>
            <strong>{openDeals.length}</strong> active deals
          </span>
        ),
      },
      {
        label: "Weighted forecast",
        value: formatCurrency(forecast),
        icon: "target",
        bg: "var(--blue-soft)",
        fg: "var(--blue)",
        meta: <span>Probability-adjusted</span>,
      },
      {
        label: "Won revenue",
        value: formatCurrency(wonValue),
        icon: "trend-up",
        bg: "var(--teal-soft)",
        fg: "var(--teal)",
        meta: (
          <span className="up">
            <strong>{winRate}%</strong> win rate
          </span>
        ),
      },
      {
        label: "Active contacts",
        value: String(activeContacts),
        icon: "contacts",
        bg: "var(--amber-soft)",
        fg: "var(--amber)",
        meta: (
          <span>
            of <strong>{contacts.length}</strong> total
          </span>
        ),
      },
    ];

    return (
      <>
        <div className="page-head">
          <div>
            <h1>Good to see you, Alex</h1>
            <p>Here’s what’s moving across your pipeline today.</p>
          </div>
          <button className="btn btn--primary" onClick={() => navigate("/deals")}>
            <Icon name="deals" size={16} />
            View pipeline
          </button>
        </div>

        <div className="stat-grid">
          {stats.map((s) => (
            <div className="stat" key={s.label}>
              <div className="stat__label">
                <span className="stat__icon" style={{ background: s.bg, color: s.fg }}>
                  <Icon name={s.icon} size={16} />
                </span>
                {s.label}
              </div>
              <div className="stat__value">{s.value}</div>
              <div className="stat__meta">{s.meta}</div>
            </div>
          ))}
        </div>

        <div className="grid-2">
          <div className="stack">
            <div className="card">
              <div className="card__head">
                <h3>Pipeline by stage</h3>
                <button
                  className="btn btn--subtle btn--sm"
                  onClick={() => navigate("/deals")}
                >
                  Open board
                </button>
              </div>
              <div className="card__body">
                {stageStats.map((s) => (
                  <div className="pipe-row" key={s.stage}>
                    <div className="pipe-row__label">
                      <span
                        className="board-col__dot"
                        style={{ background: STAGE_COLOR[s.stage] }}
                      />
                      {s.label}
                      <span className="muted mono" style={{ fontSize: 12 }}>
                        · {s.count}
                      </span>
                    </div>
                    <div className="pipe-row__track">
                      <div
                        className="pipe-row__fill"
                        style={{
                          width: `${Math.max(4, (s.value / maxStageValue) * 100)}%`,
                          background: STAGE_COLOR[s.stage],
                        }}
                      />
                    </div>
                    <div className="pipe-row__val">{formatCompact(s.value)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card__head">
                <h3>Upcoming tasks</h3>
                <button
                  className="btn btn--subtle btn--sm"
                  onClick={() => navigate("/tasks")}
                >
                  All tasks
                </button>
              </div>
              {upcoming.length === 0 ? (
                <div className="card__body muted">You’re all caught up. Nice.</div>
              ) : (
                <div>
                  {upcoming.map((t) => {
                    const contact = this.store.contactById(t.relatedContactId);
                    return (
                      <div className="task-item" key={t.id}>
                        <span
                          className="feed-item__icon"
                          style={{ background: "var(--surface-2)" }}
                        >
                          <Icon
                            name={
                              t.type === "call"
                                ? "phone"
                                : t.type === "email"
                                ? "mail"
                                : t.type === "meeting"
                                ? "calendar"
                                : "flag"
                            }
                            size={15}
                          />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="task-item__title">{t.title}</div>
                          <div className="task-item__sub">
                            {formatDate(t.dueDate)}
                            {contact
                              ? ` · ${fullName(contact.firstName, contact.lastName)}`
                              : ""}
                          </div>
                        </div>
                        <PriorityBadge priority={t.priority} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card__head">
              <h3>Recent activity</h3>
              <Icon name="activity" size={16} className="muted" />
            </div>
            <div className="card__body">
              {activities.length === 0 ? (
                <div className="muted">No activity yet.</div>
              ) : (
                <div className="feed">
                  {activities.slice(0, 8).map((a) => {
                    const meta = ACTIVITY_ICON[a.kind];
                    return (
                      <div className="feed-item" key={a.id}>
                        <span
                          className="feed-item__icon"
                          style={{ background: meta.bg, color: meta.fg }}
                        >
                          <Icon name={meta.icon} size={15} />
                        </span>
                        <div>
                          <div className="feed-item__text">{a.message}</div>
                          <div className="feed-item__time">
                            {relativeTime(a.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }} className="card">
          <div className="card__head">
            <h3>Top open deals</h3>
            <button
              className="btn btn--subtle btn--sm"
              onClick={() => navigate("/deals")}
            >
              View all
            </button>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Company</th>
                  <th>Owner</th>
                  <th style={{ textAlign: "right" }}>Value</th>
                  <th style={{ textAlign: "right" }}>Close date</th>
                </tr>
              </thead>
              <tbody>
                {[...openDeals]
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5)
                  .map((d) => {
                    const company = this.store.companyById(d.companyId);
                    return (
                      <tr key={d.id} onClick={() => navigate("/deals")}>
                        <td className="cell-primary">{d.title}</td>
                        <td className="cell-sub">{company?.name ?? "—"}</td>
                        <td>
                          <div className="person-cell">
                            <Avatar
                              label={initials(
                                d.ownerName.split(" ")[0] ?? "?",
                                d.ownerName.split(" ")[1] ?? ""
                              )}
                              seed={d.ownerName}
                              size="sm"
                            />
                            <span className="cell-sub">{d.ownerName}</span>
                          </div>
                        </td>
                        <td className="cell-num" style={{ textAlign: "right" }}>
                          {formatCurrency(d.value)}
                        </td>
                        <td
                          className="cell-sub"
                          style={{ textAlign: "right" }}
                        >
                          {formatDate(d.closeDate)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }
}

export const DashboardPage = withRouter(DashboardBase);
