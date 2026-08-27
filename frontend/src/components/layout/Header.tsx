import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { classNames } from "../../utils/classNames";
import { getRoleLabel, type UserRole } from "../../utils/auth";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import Icon, { type IconName } from "../common/Icon";

export interface NavigationItem {
  label: string;
  to: string;
  icon?: IconName;
  end?: boolean;
}

interface HeaderProps {
  navigation?: NavigationItem[];
  onLogout?: () => void;
}

const PUBLIC_NAVIGATION: NavigationItem[] = [
  { label: "Home", to: "/", end: true },
  { label: "Browse Projects", to: "/projects" },
  { label: "Find Freelancers", to: "/freelancers" },
];

const NAVIGATION_BY_ROLE: Record<UserRole, NavigationItem[]> = {
  CLIENT: [
    { label: "Dashboard", to: "/dashboard", icon: "dashboard", end: true },
    { label: "My Projects", to: "/projects/my", icon: "briefcase" },
    { label: "Find Talent", to: "/freelancers", icon: "users" },
    { label: "Browse Projects", to: "/projects", icon: "search" },
  ],
  FREELANCER: [
    { label: "Dashboard", to: "/dashboard", icon: "dashboard", end: true },
    { label: "Browse Projects", to: "/projects", icon: "search" },
    { label: "Find Freelancers", to: "/freelancers", icon: "users" },
  ],
  ADMIN: [
    { label: "Dashboard", to: "/dashboard", icon: "dashboard", end: true },
    { label: "Projects", to: "/projects", icon: "briefcase" },
    { label: "Freelancers", to: "/freelancers", icon: "users" },
  ],
};

function profilePath(role: UserRole): string {
  if (role === "CLIENT" || role === "FREELANCER") return "/profile";
  return "/dashboard";
}

export default function Header({ navigation, onLogout }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const items = navigation ?? (user ? NAVIGATION_BY_ROLE[user.role] : PUBLIC_NAVIGATION);

  const handleLogout = () => {
    onLogout?.();
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        {/* EXERTIO LOGO */}
        <Link className="brand" to="/" aria-label="Exertio Freelancer Marketplace home">
          <span className="brand__mark brand__mark--exertio" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 12L12 22L22 12L12 2Z"
                fill="url(#exertio-grad)"
              />
              <path
                d="M12 6L6 12L12 18L18 12L12 6Z"
                fill="#ffffff"
                fillOpacity="0.9"
              />
              <defs>
                <linearGradient id="exertio-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ff5b60" />
                  <stop offset="1" stopColor="#ff3366" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="brand__text brand__text--exertio">
            exertio<span>.</span>
          </span>
        </Link>

        <button
          className="site-header__menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <Icon name={menuOpen ? "close" : "menu"} size={22} />
        </button>

        <div className={classNames("site-header__content", menuOpen && "site-header__content--open")}>
          <nav className="primary-nav" id="primary-navigation" aria-label="Primary navigation">
            {items.map((item) => (
              <NavLink
                className={({ isActive }) => classNames("primary-nav__link", isActive && "primary-nav__link--active")}
                key={item.to}
                to={item.to}
                end={item.end}
              >
                {item.icon && <Icon name={item.icon} size={17} />}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="site-header__account">
            {isAuthenticated && user ? (
              <>
                {user.role === "CLIENT" && (
                  <Link to="/projects/create" className="site-header__cta-btn">
                    + Post a Project
                  </Link>
                )}
                {user.role !== "ADMIN" && (
                  <Link className="account-link" to={profilePath(user.role)} aria-label="Open your profile">
                    <Avatar name={user.email} size="sm" />
                    <span className="account-link__text">
                      <strong>{user.email.split("@")[0]}</strong>
                      <small>{getRoleLabel(user.role)}</small>
                    </span>
                  </Link>
                )}
                <Button
                  className="site-header__logout"
                  variant="ghost"
                  size="sm"
                  leftIcon={<Icon name="logout" size={17} />}
                  onClick={handleLogout}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <div className="site-header__auth-buttons">
                <Link to="/register" className="site-header__register-btn">
                  REGISTER
                </Link>
                <Link to="/login" className="site-header__signin-btn">
                  SIGN IN
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

