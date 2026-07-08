import React from "react";
import { StoreComponent } from "@/store/StoreComponent";
import { Icon, type IconName } from "@/components/ui/Icon";
import { PriorityBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TaskForm } from "@/components/forms/TaskForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { daysUntil, formatDate, fullName } from "@/lib/format";
import type { Task, TaskType } from "@/types";

type Filter = "open" | "all" | "done";

const TYPE_ICON: Record<TaskType, IconName> = {
  call: "phone",
  email: "mail",
  meeting: "calendar",
  todo: "flag",
};

interface TasksState {
  filter: Filter;
  showForm: boolean;
  editing: Task | null;
  deleting: Task | null;
}

export class TasksPage extends StoreComponent<{}, TasksState> {
  state: TasksState = {
    filter: "open",
    showForm: false,
    editing: null,
    deleting: null,
  };

  private filtered(): Task[] {
    const tasks = [...this.store.getState().tasks];
    const scoped = tasks.filter((t) => {
      if (this.state.filter === "open") return !t.done;
      if (this.state.filter === "done") return t.done;
      return true;
    });
    return scoped.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return +new Date(a.dueDate) - +new Date(b.dueDate);
    });
  }

  private dueLabel(t: Task): { text: string; className: string } {
    if (t.done) return { text: `Done`, className: "muted" };
    const d = daysUntil(t.dueDate);
    if (d < 0) return { text: `Overdue · ${formatDate(t.dueDate)}`, className: "down" };
    if (d === 0) return { text: "Due today", className: "down" };
    if (d === 1) return { text: "Due tomorrow", className: "" };
    return { text: `Due ${formatDate(t.dueDate)}`, className: "muted" };
  }

  render(): React.ReactNode {
    const rows = this.filtered();
    const all = this.store.getState().tasks;
    const openCount = all.filter((t) => !t.done).length;
    const overdue = all.filter((t) => !t.done && daysUntil(t.dueDate) < 0).length;

    const filters: { key: Filter; label: string }[] = [
      { key: "open", label: "Open" },
      { key: "done", label: "Completed" },
      { key: "all", label: "All" },
    ];

    return (
      <>
        <div className="page-head">
          <div>
            <h1>Tasks</h1>
            <p>
              {openCount} open
              {overdue > 0 ? ` · ${overdue} overdue` : ""}
            </p>
          </div>
          <button
            className="btn btn--primary"
            onClick={() => this.setState({ showForm: true, editing: null })}
          >
            <Icon name="plus" size={16} />
            New task
          </button>
        </div>

        <div className="toolbar">
          <div className="seg">
            {filters.map((f) => (
              <button
                key={f.key}
                className={this.state.filter === f.key ? "active" : ""}
                onClick={() => this.setState({ filter: f.key })}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          {rows.length === 0 ? (
            <EmptyState
              icon="tasks"
              title={
                this.state.filter === "done" ? "No completed tasks" : "No open tasks"
              }
              message={
                this.state.filter === "done"
                  ? "Completed tasks will appear here."
                  : "You’re all caught up. Add a task to stay on top of follow-ups."
              }
              actionLabel="New task"
              onAction={() => this.setState({ showForm: true, editing: null })}
            />
          ) : (
            rows.map((t) => {
              const contact = this.store.contactById(t.relatedContactId);
              const due = this.dueLabel(t);
              return (
                <div className={`task-item${t.done ? " done" : ""}`} key={t.id}>
                  <button
                    className={`checkbox${t.done ? " checked" : ""}`}
                    onClick={() => this.store.toggleTask(t.id)}
                    aria-label={t.done ? "Mark incomplete" : "Mark complete"}
                  >
                    {t.done && <Icon name="check" size={13} />}
                  </button>
                  <span
                    className="feed-item__icon"
                    style={{ background: "var(--surface-2)", color: "var(--text-2)" }}
                  >
                    <Icon name={TYPE_ICON[t.type]} size={15} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="task-item__title">{t.title}</div>
                    <div className="task-item__sub">
                      <span className={due.className}>{due.text}</span>
                      {contact
                        ? ` · ${fullName(contact.firstName, contact.lastName)}`
                        : ""}
                    </div>
                  </div>
                  <PriorityBadge priority={t.priority} />
                  <div className="row" style={{ gap: 2 }}>
                    <button
                      className="icon-btn"
                      aria-label="Edit"
                      onClick={() => this.setState({ showForm: true, editing: t })}
                    >
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      className="icon-btn"
                      aria-label="Delete"
                      onClick={() => this.setState({ deleting: t })}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {this.state.showForm && (
          <TaskForm
            existing={this.state.editing}
            contacts={this.store.getState().contacts}
            onClose={() => this.setState({ showForm: false, editing: null })}
          />
        )}

        {this.state.deleting && (
          <ConfirmDialog
            title="Delete task"
            message={`Delete “${this.state.deleting.title}”?`}
            onConfirm={() => {
              this.store.deleteTask(this.state.deleting!.id);
              this.setState({ deleting: null });
              toast.show("Task deleted");
            }}
            onCancel={() => this.setState({ deleting: null })}
          />
        )}
      </>
    );
  }
}
