import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Card, { CardBody, CardFooter, CardHeader } from "../common/Card";
import Icon from "../common/Icon";

interface AuthLayoutProps {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthLayout({
  eyebrow = "Welcome",
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <div className="auth-shell__backdrop" aria-hidden="true" />

      <aside className="auth-shell__brand" aria-labelledby="auth-brand-title">
        <Link className="auth-shell__brand-link" to="/" aria-label="Freelancer Marketplace home">
          <span className="auth-shell__brand-mark" aria-hidden="true">
            <Icon name="briefcase" size={24} />
          </span>
          <span>Freelancer Marketplace</span>
        </Link>

        <div className="auth-shell__brand-content">
          <p className="auth-shell__eyebrow">Work without boundaries</p>
          <h2 className="auth-shell__title" id="auth-brand-title">
            Find the right people. Build meaningful work.
          </h2>
          <p className="auth-shell__copy">
            A focused marketplace where clients and independent professionals can connect,
            collaborate, and move projects forward.
          </p>

          <ul className="auth-shell__features" aria-label="Platform benefits">
            <li className="auth-shell__feature">
              <Icon name="check-circle" size={20} />
              <span>Discover opportunities matched to your skills</span>
            </li>
            <li className="auth-shell__feature">
              <Icon name="check-circle" size={20} />
              <span>Manage projects and conversations in one place</span>
            </li>
            <li className="auth-shell__feature">
              <Icon name="check-circle" size={20} />
              <span>Keep every step clear, secure, and organized</span>
            </li>
          </ul>
        </div>
      </aside>

      <main className="auth-panel">
        <Card className="auth-card" padding="lg">
          <CardHeader className="auth-card__header">
            <p className="auth-card__eyebrow">{eyebrow}</p>
            <h1 className="auth-card__title">{title}</h1>
            <p className="auth-card__description">{description}</p>
          </CardHeader>
          <CardBody className="auth-card__body">{children}</CardBody>
          {footer && <CardFooter className="auth-card__footer">{footer}</CardFooter>}
        </Card>
      </main>
    </div>
  );
}

interface AuthAlertProps {
  tone?: "error" | "success";
  title: string;
  children?: ReactNode;
}

export function AuthAlert({ tone = "error", title, children }: AuthAlertProps) {
  const isError = tone === "error";

  return (
    <div
      className={`auth-alert auth-alert--${tone}`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
    >
      <Icon name={isError ? "error" : "check-circle"} size={20} />
      <div>
        <strong>{title}</strong>
        {children && <p>{children}</p>}
      </div>
    </div>
  );
}

interface PasswordToggleProps {
  visible: boolean;
  onToggle: () => void;
}

export function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  const label = visible ? "Hide password" : "Show password";

  return (
    <button
      className="password-toggle"
      type="button"
      onClick={onToggle}
      onMouseDown={(event) => event.preventDefault()}
      aria-label={label}
      aria-pressed={visible}
      title={label}
    >
      <Icon name={visible ? "eye-off" : "eye"} size={18} />
    </button>
  );
}

const AUTH_PATHS = new Set(["/login", "/register", "/forgot-password", "/reset-password"]);

export function getAuthDestination(state: unknown, fallback = "/dashboard"): string {
  if (!state || typeof state !== "object") return fallback;

  const from = (state as { from?: unknown }).from;
  if (!from || typeof from !== "object") return fallback;

  const route = from as { pathname?: unknown; search?: unknown; hash?: unknown };
  if (
    typeof route.pathname !== "string" ||
    !route.pathname.startsWith("/") ||
    route.pathname.startsWith("//") ||
    AUTH_PATHS.has(route.pathname)
  ) {
    return fallback;
  }

  const search = typeof route.search === "string" && route.search.startsWith("?")
    ? route.search
    : "";
  const hash = typeof route.hash === "string" && route.hash.startsWith("#")
    ? route.hash
    : "";

  return `${route.pathname}${search}${hash}`;
}
