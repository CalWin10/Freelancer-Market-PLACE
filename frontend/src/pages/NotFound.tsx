import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import Icon from "../components/common/Icon";

export default function NotFound() {
  return (
    <div className="page-container page-container--narrow not-found-page">
      <Card className="not-found-card" padding="lg">
        <span className="not-found-card__code">404</span>
        <div className="not-found-card__icon"><Icon name="search" size={28} /></div>
        <h1>We could not find that page</h1>
        <p>The link may be outdated, or the page may have moved.</p>
        <Link className="button button--primary button--md" to="/dashboard">
          <Icon name="dashboard" size={17} /> Back to dashboard
        </Link>
      </Card>
    </div>
  );
}
