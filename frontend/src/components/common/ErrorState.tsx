import type { ReactNode } from "react";
import { classNames } from "../../utils/classNames";
import Button from "./Button";
import Icon from "./Icon";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  action,
  compact = false,
  className,
}: ErrorStateProps) {
  return (
    <div className={classNames("error-state", compact && "error-state--compact", className)} role="alert">
      <span className="error-state__icon" aria-hidden="true"><Icon name="error" size={28} /></span>
      <h2 className="error-state__title">{title}</h2>
      <p className="error-state__message">{message}</p>
      {(onRetry || action) && (
        <div className="error-state__action">
          {onRetry && <Button variant="secondary" leftIcon={<Icon name="refresh" size={17} />} onClick={onRetry}>{retryLabel}</Button>}
          {action}
        </div>
      )}
    </div>
  );
}
