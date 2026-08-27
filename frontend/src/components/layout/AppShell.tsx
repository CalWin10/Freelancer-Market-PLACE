import { useEffect, type ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header, { type NavigationItem } from "./Header";

interface AppShellProps {
  children?: ReactNode;
  navigation?: NavigationItem[];
  footer?: ReactNode;
}

export default function AppShell({ children, navigation, footer }: AppShellProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header navigation={navigation} />
      <main className="app-main" id="main-content" tabIndex={-1}>
        {children ?? <Outlet />}
      </main>
      <Footer>{footer}</Footer>
    </div>
  );
}
