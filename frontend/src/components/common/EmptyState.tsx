import type { ReactNode } from "react";
import { classNames } from "../../utils/classNames";
import Icon, { type IconName } from "./Icon";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName | ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon = "briefcase",
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  const renderedIcon = typeof icon === "string" ? <Icon name={icon as IconName} size={28} /> : icon;

  return (
    <div className={classNames("empty-state", compact && "empty-state--compact", className)}>
      <span className="empty-state__icon" aria-hidden="true">{renderedIcon}</span>
      <h2 className="empty-state__title">{title}</h2>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
