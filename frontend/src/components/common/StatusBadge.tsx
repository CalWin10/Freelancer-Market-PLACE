import { classNames } from "../../utils/classNames";
import { formatStatus } from "../../utils/format";

export type StatusTone = "success" | "info" | "warning" | "danger" | "neutral" | "accent";

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: "sm" | "md";
  showDot?: boolean;
  className?: string;
}

const STATUS_TONES: Record<string, StatusTone> = {
  OPEN: "success",
  AVAILABLE: "success",
  ACTIVE: "success",
  ACCEPTED: "success",
  COMPLETED: "success",
  ASSIGNED: "accent",
  IN_PROGRESS: "info",
  PENDING: "warning",
  DRAFT: "neutral",
  CANCELLED: "neutral",
  REJECTED: "danger",
  INACTIVE: "neutral",
  LOCKED: "danger",
};

export function getStatusTone(status: string): StatusTone {
  return STATUS_TONES[status.toUpperCase()] ?? "neutral";
}

export default function StatusBadge({
  status,
  label,
  size = "md",
  showDot = true,
  className,
}: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase();
  const tone = getStatusTone(normalizedStatus);

  return (
    <span className={classNames("status-badge", `status-badge--${tone}`, `status-badge--${size}`, className)}>
      {showDot && <span className="status-badge__dot" aria-hidden="true" />}
      {label ?? formatStatus(normalizedStatus)}
    </span>
  );
}
