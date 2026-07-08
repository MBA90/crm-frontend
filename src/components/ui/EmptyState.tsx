import React from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export class EmptyState extends React.Component<EmptyStateProps> {
  render(): React.ReactNode {
    const { icon, title, message, actionLabel, onAction } = this.props;
    return (
      <div className="empty">
        <div className="empty__icon">
          <Icon name={icon} size={24} />
        </div>
        <h4>{title}</h4>
        <p>{message}</p>
        {actionLabel && onAction && (
          <button className="btn btn--primary btn--sm" onClick={onAction}>
            <Icon name="plus" size={16} />
            {actionLabel}
          </button>
        )}
      </div>
    );
  }
}
