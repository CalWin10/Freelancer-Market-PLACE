import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "../../utils/classNames";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

export default function Card({
  padding = "md",
  interactive = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={classNames(
        "card",
        `card--padding-${padding}`,
        interactive && "card--interactive",
        className,
      )}
    />
  );
}

interface CardSectionProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, description, action, className, children, ...props }: CardSectionProps) {
  return (
    <div {...props} className={classNames("card__header", className)}>
      <div className="card__heading">
        {title && <h2 className="card__title">{title}</h2>}
        {description && <p className="card__description">{description}</p>}
        {children}
      </div>
      {action && <div className="card__action">{action}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classNames("card__body", className)} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classNames("card__footer", className)} />;
}
