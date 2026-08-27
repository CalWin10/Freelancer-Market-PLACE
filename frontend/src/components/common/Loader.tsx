import { classNames } from "../../utils/classNames";

interface LoaderProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
  className?: string;
}

export default function Loader({
  label = "Loading",
  size = "md",
  fullPage = false,
  className,
}: LoaderProps) {
  return (
    <div
      className={classNames("loader", `loader--${size}`, fullPage && "loader--full-page", className)}
      role="status"
      aria-live="polite"
    >
      <span className="loader__spinner" aria-hidden="true" />
      <span className="loader__label">{label}</span>
    </div>
  );
}

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
}

export function Skeleton({ width, height, circle = false, className }: SkeletonProps) {
  return (
    <span
      className={classNames("skeleton", circle && "skeleton--circle", className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card card--padding-md skeleton-card" aria-hidden="true">
      <div className="skeleton-card__header">
        <Skeleton circle width={48} height={48} />
        <div className="skeleton-card__heading">
          <Skeleton width="54%" height={16} />
          <Skeleton width="34%" height={12} />
        </div>
      </div>
      <Skeleton width="100%" height={12} />
      <Skeleton width="88%" height={12} />
      <Skeleton width="62%" height={12} />
    </div>
  );
}
