import React from "react";
import { Modal } from "@/components/ui/Modal";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export class ConfirmDialog extends React.Component<ConfirmDialogProps> {
  render(): React.ReactNode {
    const { title, message, confirmLabel = "Delete", onConfirm, onCancel } = this.props;
    return (
      <Modal
        title={title}
        onClose={onCancel}
        footer={
          <>
            <button className="btn btn--ghost" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="btn btn--primary"
              style={{ background: "var(--rose)" }}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </>
        }
      >
        <p style={{ margin: 0, color: "var(--text-2)", lineHeight: 1.55 }}>{message}</p>
      </Modal>
    );
  }
}
