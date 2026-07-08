import React from "react";
import { Icon } from "@/components/ui/Icon";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}

export class Modal extends React.Component<ModalProps> {
  componentDidMount(): void {
    document.addEventListener("keydown", this.handleKey);
    document.body.style.overflow = "hidden";
  }

  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.handleKey);
    document.body.style.overflow = "";
  }

  private handleKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") this.props.onClose();
  };

  private handleOverlay = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget) this.props.onClose();
  };

  render(): React.ReactNode {
    const { title, onClose, children, footer, wide } = this.props;
    return (
      <div className="modal-overlay" onMouseDown={this.handleOverlay}>
        <div
          className={wide ? "modal modal--wide" : "modal"}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="modal__head">
            <h2>{title}</h2>
            <button className="icon-btn" onClick={onClose} aria-label="Close">
              <Icon name="close" size={18} />
            </button>
          </div>
          <div className="modal__body">{children}</div>
          {footer && <div className="modal__foot">{footer}</div>}
        </div>
      </div>
    );
  }
}
