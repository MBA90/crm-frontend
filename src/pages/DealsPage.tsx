import React from "react";
import { StoreComponent } from "@/store/StoreComponent";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { DealStageBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DealForm } from "@/components/forms/DealForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import {
  formatCompact,
  formatCurrency,
  formatDate,
  initials,
} from "@/lib/format";
import { DEAL_STAGES } from "@/types";
import type { Deal, DealStage } from "@/types";

const STAGE_COLOR: Record<DealStage, string> = {
  lead: "#838ba1",
  qualified: "#2f6fed",
  proposal: "#4b44e0",
  negotiation: "#b8790a",
  won: "#0e9488",
  lost: "#d43f45",
};

interface DealsState {
  view: "board" | "list";
  query: string;
  showForm: boolean;
  editing: Deal | null;
  defaultStage: DealStage;
  deleting: Deal | null;
  draggingId: string | null;
  dragOverStage: DealStage | null;
}

export class DealsPage extends StoreComponent<{}, DealsState> {
  state: DealsState = {
    view: "board",
    query: "",
    showForm: false,
    editing: null,
    defaultStage: "lead",
    deleting: null,
    draggingId: null,
    dragOverStage: null,
  };

  private matching(deals: Deal[]): Deal[] {
    const q = this.state.query.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter((d) => {
      const company = this.store.companyById(d.companyId);
      return (
        d.title.toLowerCase().includes(q) ||
        d.ownerName.toLowerCase().includes(q) ||
        (company?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }

  // ---- drag & drop -------------------------------------------------------
  private handleDragStart = (e: React.DragEvent, id: string): void => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    this.setState({ draggingId: id });
  };
  private handleDragEnd = (): void => {
    this.setState({ draggingId: null, dragOverStage: null });
  };
  private handleDragOver = (e: React.DragEvent, stage: DealStage): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (this.state.dragOverStage !== stage) this.setState({ dragOverStage: stage });
  };
  private handleDrop = (e: React.DragEvent, stage: DealStage): void => {
    e.preventDefault();
    const id = this.state.draggingId ?? e.dataTransfer.getData("text/plain");
    if (id) {
      const deal = this.store.getState().deals.find((d) => d.id === id);
      this.store.moveDealStage(id, stage);
      if (deal && deal.stage !== stage) {
        toast.show(
          stage === "won"
            ? "Deal won 🎉"
            : `Moved to ${DEAL_STAGES.find((s) => s.key === stage)?.label}`
        );
      }
    }
    this.setState({ draggingId: null, dragOverStage: null });
  };

  private openNew = (stage: DealStage = "lead"): void => {
    this.setState({ showForm: true, editing: null, defaultStage: stage });
  };

  private renderBoard(deals: Deal[]): React.ReactNode {
    return (
      <div className="board">
        {DEAL_STAGES.map((stageDef) => {
          const stage = stageDef.key;
          const inStage = deals.filter((d) => d.stage === stage);
          const sum = inStage.reduce((s, d) => s + d.value, 0);
          const isOver = this.state.dragOverStage === stage;
          return (
            <div
              key={stage}
              className={`board-col${isOver ? " drop-target" : ""}`}
              onDragOver={(e) => this.handleDragOver(e, stage)}
              onDrop={(e) => this.handleDrop(e, stage)}
            >
              <div className="board-col__head">
                <span
                  className="board-col__dot"
                  style={{ background: STAGE_COLOR[stage] }}
                />
                <span className="board-col__title">{stageDef.label}</span>
                <span className="board-col__count">{inStage.length}</span>
                <span className="board-col__sum">{formatCompact(sum)}</span>
              </div>
              <div className="board-col__body">
                {inStage.map((d) => {
                  const company = this.store.companyById(d.companyId);
                  return (
                    <div
                      key={d.id}
                      className={`deal-card${
                        this.state.draggingId === d.id ? " dragging" : ""
                      }`}
                      draggable
                      onDragStart={(e) => this.handleDragStart(e, d.id)}
                      onDragEnd={this.handleDragEnd}
                      onClick={() => this.setState({ showForm: true, editing: d })}
                    >
                      <div className="deal-card__title">{d.title}</div>
                      <div className="deal-card__value">{formatCurrency(d.value)}</div>
                      <div className="deal-card__meta">
                        <Icon name="companies" size={13} />
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {company?.name ?? "No company"}
                        </span>
                      </div>
                      <div className="prob-bar">
                        <span
                          style={{
                            width: `${d.probability}%`,
                            background: STAGE_COLOR[stage],
                          }}
                        />
                      </div>
                      <div className="deal-card__meta" style={{ marginTop: 8 }}>
                        <Avatar
                          label={initials(
                            d.ownerName.split(" ")[0] ?? "?",
                            d.ownerName.split(" ")[1] ?? ""
                          )}
                          seed={d.ownerName}
                          size="sm"
                        />
                        <span>{d.probability}% · {formatDate(d.closeDate)}</span>
                      </div>
                    </div>
                  );
                })}
                <button
                  className="btn btn--subtle btn--sm"
                  style={{ justifyContent: "flex-start", width: "100%" }}
                  onClick={() => this.openNew(stage)}
                >
                  <Icon name="plus" size={14} /> Add deal
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  private renderList(deals: Deal[]): React.ReactNode {
    if (deals.length === 0) {
      return (
        <div className="card">
          <EmptyState
            icon="deals"
            title="No deals found"
            message="Adjust your search or create a new deal."
            actionLabel="New deal"
            onAction={() => this.openNew()}
          />
        </div>
      );
    }
    return (
      <div className="card">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Company</th>
                <th>Stage</th>
                <th>Owner</th>
                <th style={{ textAlign: "right" }}>Value</th>
                <th style={{ textAlign: "right" }}>Close</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d) => {
                const company = this.store.companyById(d.companyId);
                return (
                  <tr
                    key={d.id}
                    onClick={() => this.setState({ showForm: true, editing: d })}
                  >
                    <td className="cell-primary">{d.title}</td>
                    <td className="cell-sub">{company?.name ?? "—"}</td>
                    <td>
                      <DealStageBadge stage={d.stage} />
                    </td>
                    <td className="cell-sub">{d.ownerName}</td>
                    <td className="cell-num" style={{ textAlign: "right" }}>
                      {formatCurrency(d.value)}
                    </td>
                    <td className="cell-sub" style={{ textAlign: "right" }}>
                      {formatDate(d.closeDate)}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          aria-label="Edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.setState({ showForm: true, editing: d });
                          }}
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          aria-label="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.setState({ deleting: d });
                          }}
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  render(): React.ReactNode {
    const state = this.store.getState();
    const deals = this.matching(state.deals);
    const open = deals.filter((d) =>
      ["lead", "qualified", "proposal", "negotiation"].includes(d.stage)
    );
    const openValue = open.reduce((s, d) => s + d.value, 0);

    return (
      <>
        <div className="page-head">
          <div>
            <h1>Pipeline</h1>
            <p>
              {open.length} open deals · {formatCurrency(openValue)} in play
            </p>
          </div>
          <button className="btn btn--primary" onClick={() => this.openNew()}>
            <Icon name="plus" size={16} />
            New deal
          </button>
        </div>

        <div className="toolbar">
          <div className="search-inline">
            <Icon name="search" size={16} />
            <input
              placeholder="Search deals…"
              value={this.state.query}
              onChange={(e) => this.setState({ query: e.target.value })}
            />
          </div>
          <div className="seg">
            <button
              className={this.state.view === "board" ? "active" : ""}
              onClick={() => this.setState({ view: "board" })}
            >
              Board
            </button>
            <button
              className={this.state.view === "list" ? "active" : ""}
              onClick={() => this.setState({ view: "list" })}
            >
              List
            </button>
          </div>
        </div>

        {this.state.view === "board"
          ? this.renderBoard(deals)
          : this.renderList(deals)}

        {this.state.showForm && (
          <DealForm
            existing={this.state.editing}
            defaultStage={this.state.defaultStage}
            contacts={state.contacts}
            companies={state.companies}
            onClose={() => this.setState({ showForm: false, editing: null })}
          />
        )}

        {this.state.deleting && (
          <ConfirmDialog
            title="Delete deal"
            message={`Delete “${this.state.deleting.title}”? This can’t be undone.`}
            onConfirm={() => {
              this.store.deleteDeal(this.state.deleting!.id);
              this.setState({ deleting: null });
              toast.show("Deal deleted");
            }}
            onCancel={() => this.setState({ deleting: null })}
          />
        )}
      </>
    );
  }
}
