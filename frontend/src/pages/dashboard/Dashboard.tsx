import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FreelancerCard from "../../components/cards/FreelancerCard";
import ProjectCard from "../../components/cards/ProjectCard";
import Avatar from "../../components/common/Avatar";
import Card from "../../components/common/Card";
import ErrorState from "../../components/common/ErrorState";
import Icon, { type IconName } from "../../components/common/Icon";
import { SkeletonCard } from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";
import { getAdminDashboard } from "../../services/adminService";
import { getApiErrorMessage } from "../../services/api";
import { getMyProjects, searchProjects } from "../../services/projectService";
import { searchFreelancers, type FreelancerResult } from "../../services/searchService";
import {
  getClientProfile,
  getFreelancerProfile,
  type ClientProfile,
  type FreelancerProfile,
} from "../../services/userService";
import type { ProjectSummary } from "../../types/project";
import { formatCurrency } from "../../utils/format";

const DEMO_FREELANCERS: FreelancerResult[] = [
  {
    id: 1,
    fullName: "Michael Spitz",
    email: "michael.spitz@example.com",
    location: "Los Angeles, CA",
    hourlyRate: 80,
    skills: ["Design", "Frontend Developer", "Figma", "UI/UX"],
    bio: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    profilePhotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    fullName: "Marco Coppeto",
    email: "marco.coppeto@example.com",
    location: "New York, NY",
    hourlyRate: 80,
    skills: ["Design", "Frontend Developer", "React", "Next.js"],
    bio: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    profilePhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    fullName: "Gene Ross",
    email: "gene.ross@example.com",
    location: "Los Angeles, CA",
    hourlyRate: 80,
    skills: ["Design", "Frontend Developer", "Vue.js", "Illustrator"],
    bio: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    profilePhotoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    fullName: "Michael Spitz",
    email: "michael.spitz2@example.com",
    location: "Los Angeles, CA",
    hourlyRate: 80,
    skills: ["Design", "Frontend Developer", "Tailwind", "CSS"],
    bio: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    profilePhotoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: 5,
    fullName: "Marco Coppeto",
    email: "marco.coppeto2@example.com",
    location: "New York, NY",
    hourlyRate: 80,
    skills: ["Design", "Frontend Developer", "TypeScript", "Node.js"],
    bio: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    profilePhotoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80",
  },
  {
    id: 6,
    fullName: "Gene Ross",
    email: "gene.ross2@example.com",
    location: "Los Angeles, CA",
    hourlyRate: 80,
    skills: ["Design", "Frontend Developer", "Product Design", "Mobile"],
    bio: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    profilePhotoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"freelancers" | "jobs" | "projects" | "overview">("freelancers");
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [freelancers, setFreelancers] = useState<FreelancerResult[]>(DEMO_FREELANCERS);
  const [skillsFilter, setSkillsFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [rateFilter, setRateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invitedFreelancer, setInvitedFreelancer] = useState<FreelancerResult | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      if (user.role === "CLIENT") {
        const [projectPage, freelancerPage] = await Promise.all([
          getMyProjects(0, 10).catch(() => ({ content: [] })),
          searchFreelancers({ page: 0, size: 6 }).catch(() => ({ content: [] })),
        ]);
        setProjects(projectPage.content || []);
        if (freelancerPage.content && freelancerPage.content.length > 0) {
          setFreelancers(freelancerPage.content);
        } else {
          setFreelancers(DEMO_FREELANCERS);
        }
      } else {
        const [projectPage, freelancerPage] = await Promise.all([
          searchProjects({ status: "OPEN", page: 0, size: 6 }).catch(() => ({ content: [] })),
          searchFreelancers({ page: 0, size: 6 }).catch(() => ({ content: [] })),
        ]);
        setProjects(projectPage.content || []);
        if (freelancerPage.content && freelancerPage.content.length > 0) {
          setFreelancers(freelancerPage.content);
        } else {
          setFreelancers(DEMO_FREELANCERS);
        }
      }
    } catch (requestError) {
      setFreelancers(DEMO_FREELANCERS);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredFreelancers = useMemo(() => {
    let list = freelancers;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.fullName.toLowerCase().includes(q) ||
          f.skills?.some((s) => s.toLowerCase().includes(q)) ||
          f.location?.toLowerCase().includes(q)
      );
    }
    if (skillsFilter.trim()) {
      const s = skillsFilter.toLowerCase();
      list = list.filter((f) => f.skills?.some((sk) => sk.toLowerCase().includes(s)));
    }
    if (locationFilter.trim()) {
      const l = locationFilter.toLowerCase();
      list = list.filter((f) => f.location?.toLowerCase().includes(l));
    }
    if (rateFilter.trim()) {
      const max = Number(rateFilter);
      if (max) list = list.filter((f) => (f.hourlyRate || 0) <= max);
    }
    return list;
  }, [freelancers, searchQuery, skillsFilter, locationFilter, rateFilter]);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleInvite = (freelancer: FreelancerResult) => {
    setInvitedFreelancer(freelancer);
  };

  if (!user) return null;

  return (
    <div className="dashboard-saas-layout">
      {/* 1. LEFT SIDEBAR (Under Top Header) */}
      <aside className="dashboard-saas-sidebar">
        <nav className="dashboard-saas-nav">
          <button
            type="button"
            className={`dashboard-saas-nav-btn ${activeTab === "freelancers" ? "is-active" : ""}`}
            onClick={() => setActiveTab("freelancers")}
          >
            <Icon name="dashboard" size={18} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`dashboard-saas-nav-btn ${activeTab === "overview" ? "is-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Icon name="users" size={18} />
            <span>Employees</span>
          </button>

          <button
            type="button"
            className={`dashboard-saas-nav-btn ${activeTab === "freelancers" ? "is-active" : ""}`}
            onClick={() => setActiveTab("freelancers")}
          >
            <Icon name="dollar" size={18} />
            <span>Freelancers</span>
          </button>

          <button
            type="button"
            className={`dashboard-saas-nav-btn ${activeTab === "jobs" ? "is-active" : ""}`}
            onClick={() => setActiveTab("jobs")}
          >
            <Icon name="briefcase" size={18} />
            <span>Jobs</span>
          </button>

          <Link to="/profile" className="dashboard-saas-nav-btn">
            <Icon name="settings" size={18} />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      {/* 2. MAIN DASHBOARD CONTENT */}
      <main className="dashboard-saas-main">
        {/* Top Search & Actions Row */}
        <div className="dashboard-saas-topbar">
          <form className="dashboard-saas-search" onSubmit={handleGlobalSearch}>
            <Icon name="search" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="dashboard-saas-actions">
            {user.role === "CLIENT" ? (
              <Link to="/projects/create" className="dashboard-saas-post-btn">
                Post Job
              </Link>
            ) : (
              <Link to="/projects" className="dashboard-saas-post-btn">
                Browse Jobs
              </Link>
            )}

            <button type="button" className="dashboard-saas-icon-btn" aria-label="Notifications">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>

            <Link to="/profile" className="dashboard-saas-avatar-btn">
              <Avatar name={user.email} size="sm" />
            </Link>
          </div>
        </div>

        {/* Header Row: Title & Inline Filters */}
        {activeTab === "freelancers" && (
          <>
            <div className="saas-page-header">
              <h1 className="saas-page-title">Freelancers</h1>

              <div className="saas-inline-filters">
                <span className="saas-filter-label">Filter</span>
                <div className="saas-filter-input-wrap">
                  <input
                    type="text"
                    className="saas-filter-input"
                    placeholder="Skills"
                    value={skillsFilter}
                    onChange={(e) => setSkillsFilter(e.target.value)}
                  />
                </div>
                <div className="saas-filter-input-wrap">
                  <input
                    type="text"
                    className="saas-filter-input"
                    placeholder="Location"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
                <div className="saas-filter-input-wrap">
                  <input
                    type="text"
                    className="saas-filter-input"
                    placeholder="Hourly rate"
                    value={rateFilter}
                    onChange={(e) => setRateFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 3-Column Freelancer Cards Grid */}
            <div className="saas-cards-grid">
              {loading ? (
                Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} />)
              ) : filteredFreelancers.length === 0 ? (
                <div className="saas-empty-state">
                  <Icon name="users" size={32} />
                  <p>No freelancers match your search filters.</p>
                  <button
                    type="button"
                    className="saas-clear-btn"
                    onClick={() => {
                      setSearchQuery("");
                      setSkillsFilter("");
                      setLocationFilter("");
                      setRateFilter("");
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredFreelancers.map((freelancer) => (
                  <FreelancerCard
                    key={freelancer.id}
                    freelancer={freelancer}
                    onInvite={handleInvite}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <div>
            <div className="saas-page-header">
              <h1 className="saas-page-title">Active Projects & Jobs</h1>
              <Link to="/projects" className="button button--primary button--sm">
                Explore All Listings
              </Link>
            </div>

            <div className="content-grid content-grid--projects">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <Card padding="lg" style={{ textAlign: "center", gridColumn: "1 / -1" }}>
                  <p>No projects posted yet.</p>
                  <Link to="/projects/create" className="button button--primary button--sm" style={{ marginTop: "1rem" }}>
                    Create Your First Project
                  </Link>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <div className="saas-page-header">
              <h1 className="saas-page-title">Team & Workspace Overview</h1>
            </div>
            <div className="stats-grid">
              <Card className="stat-card stat-card--accent">
                <div className="stat-card__icon"><Icon name="users" size={21} /></div>
                <div>
                  <span className="stat-card__label">Active Freelancers</span>
                  <strong className="stat-card__value">124</strong>
                  <span className="stat-card__detail">Available for hire</span>
                </div>
              </Card>
              <Card className="stat-card stat-card--success">
                <div className="stat-card__icon"><Icon name="briefcase" size={21} /></div>
                <div>
                  <span className="stat-card__label">Projects Completed</span>
                  <strong className="stat-card__value">48</strong>
                  <span className="stat-card__detail">100% on time</span>
                </div>
              </Card>
              <Card className="stat-card stat-card--warning">
                <div className="stat-card__icon"><Icon name="dollar" size={21} /></div>
                <div>
                  <span className="stat-card__label">Avg. Hourly Rate</span>
                  <strong className="stat-card__value">$65.00</strong>
                  <span className="stat-card__detail">Across all skills</span>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Invite Modal */}
      {invitedFreelancer && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-backdrop" onClick={() => setInvitedFreelancer(null)} />
          <div className="modal-container saas-invite-modal">
            <div className="modal-header">
              <h3>Invite {invitedFreelancer.fullName}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setInvitedFreelancer(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Send an invitation to <strong>{invitedFreelancer.fullName}</strong> to collaborate on your project.</p>
              <div className="form-field" style={{ marginTop: "1rem" }}>
                <label className="form-field__label">Project Title</label>
                <select className="form-control">
                  <option>E-Commerce UI Redesign ($1,500)</option>
                  <option>Full-Stack Mobile App MVP ($3,200)</option>
                  <option>Brand Identity & Design System ($850)</option>
                </select>
              </div>
              <div className="form-field" style={{ marginTop: "1rem" }}>
                <label className="form-field__label">Message</label>
                <textarea
                  className="form-control"
                  rows={3}
                  defaultValue={`Hi ${invitedFreelancer.fullName}, I love your portfolio and would like to invite you to our project.`}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="button button--secondary button--sm"
                onClick={() => setInvitedFreelancer(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button--primary button--sm"
                onClick={() => {
                  alert(`Invitation sent to ${invitedFreelancer.fullName}!`);
                  setInvitedFreelancer(null);
                }}
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
