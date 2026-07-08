import React from "react";
import { Modal } from "@/components/ui/Modal";
import { crmStore } from "@/store/CrmStore";
import { toast } from "@/components/ui/Toast";
import { fullName } from "@/lib/format";
import type { Contact, Task, TaskPriority, TaskType } from "@/types";

interface TaskFormProps {
  existing: Task | null;
  contacts: Contact[];
  onClose: () => void;
}
interface TaskFormState {
  title: string;
  type: TaskType;
  priority: TaskPriority;
  dueDate: string;
  relatedContactId: string;
  error: string;
}

function toDateInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export class TaskForm extends React.Component<TaskFormProps, TaskFormState> {
  constructor(props: TaskFormProps) {
    super(props);
    const t = props.existing;
    this.state = {
      title: t?.title ?? "",
      type: t?.type ?? "todo",
      priority: t?.priority ?? "medium",
      dueDate: toDateInput(t?.dueDate ?? new Date().toISOString()),
      relatedContactId: t?.relatedContactId ?? "",
      error: "",
    };
  }

  private handleSubmit = (): void => {
    if (!this.state.title.trim()) {
      this.setState({ error: "Task title is required." });
      return;
    }
    const payload = {
      title: this.state.title.trim(),
      type: this.state.type,
      priority: this.state.priority,
      dueDate: this.state.dueDate
        ? new Date(this.state.dueDate).toISOString()
        : new Date().toISOString(),
      relatedContactId: this.state.relatedContactId || null,
      done: this.props.existing?.done ?? false,
    };
    if (this.props.existing) {
      crmStore.updateTask(this.props.existing.id, payload);
      toast.show("Task updated");
    } else {
      crmStore.addTask(payload);
      toast.show("Task added");
    }
    this.props.onClose();
  };

  render(): React.ReactNode {
    const { existing, contacts, onClose } = this.props;
    const { error } = this.state;
    return (
      <Modal
        title={existing ? "Edit task" : "New task"}
        onClose={onClose}
        footer={
          <>
            <button className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" onClick={this.handleSubmit}>
              {existing ? "Save changes" : "Add task"}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="field field--full">
            <label>Task</label>
            <input
              className={error ? "invalid" : ""}
              value={this.state.title}
              onChange={(e) => this.setState({ title: e.target.value, error: "" })}
              placeholder="e.g. Follow up on proposal"
              autoFocus
            />
            {error && <span className="error-text">{error}</span>}
          </div>
          <div className="field">
            <label>Type</label>
            <select
              value={this.state.type}
              onChange={(e) => this.setState({ type: e.target.value as TaskType })}
            >
              <option value="todo">To-do</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>
          <div className="field">
            <label>Priority</label>
            <select
              value={this.state.priority}
              onChange={(e) =>
                this.setState({ priority: e.target.value as TaskPriority })
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="field">
            <label>Due date</label>
            <input
              type="date"
              value={this.state.dueDate}
              onChange={(e) => this.setState({ dueDate: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Related contact</label>
            <select
              value={this.state.relatedContactId}
              onChange={(e) => this.setState({ relatedContactId: e.target.value })}
            >
              <option value="">— None —</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {fullName(c.firstName, c.lastName)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    );
  }
}
