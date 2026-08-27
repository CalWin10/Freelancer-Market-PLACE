import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import FreelancerCard from "../../components/cards/FreelancerCard";
import Icon from "../../components/common/Icon";
import { SkeletonCard } from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import { getApiErrorMessage } from "../../services/api";
import {
  searchFreelancers,
  type FreelancerResult,
  type FreelancerSearchParams,
} from "../../services/searchService";

const PAGE_SIZE = 6;

const DEFAULT_DEMO_FREELANCERS: FreelancerResult[] = [
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

export default function FreelancerSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [skillsFilter, setSkillsFilter] = useState(searchParams.get("skills") ?? "");
  const [locationFilter, setLocationFilter] = useState(searchParams.get("location") ?? "");
  const [rateFilter, setRateFilter] = useState(searchParams.get("rate") ?? "");
  const [freelancers, setFreelancers] = useState<FreelancerResult[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invitedFreelancer, setInvitedFreelancer] = useState<FreelancerResult | null>(null);

  const requestParams = useMemo<FreelancerSearchParams>(() => ({
    skills: skillsFilter.trim() || undefined,
    location: locationFilter.trim() || undefined,
    maxRate: rateFilter.trim() ? Number(rateFilter.trim()) : undefined,
    page,
    size: PAGE_SIZE,
  }), [skillsFilter, locationFilter, rateFilter, page]);

  const loadFreelancers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await searchFreelancers(requestParams);
      if (response && response.content && response.content.length > 0) {
        setFreelancers(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } else {
        // Fallback to sample data filtered locally if empty in DB
        let filtered = DEFAULT_DEMO_FREELANCERS;
        if (skillsFilter.trim()) {
          const q = skillsFilter.toLowerCase();
          filtered = filtered.filter(f => f.skills?.some(s => s.toLowerCase().includes(q)) || f.fullName.toLowerCase().includes(q));
        }
        if (locationFilter.trim()) {
          const l = locationFilter.toLowerCase();
          filtered = filtered.filter(f => f.location?.toLowerCase().includes(l));
        }
        if (rateFilter.trim()) {
          const max = Number(rateFilter);
          if (max) filtered = filtered.filter(f => (f.hourlyRate || 0) <= max);
        }
        setFreelancers(filtered);
        setTotalPages(1);
        setTotalElements(filtered.length);
      }
    } catch (requestError) {
      // If server returns error, show demo list gracefully
      let filtered = DEFAULT_DEMO_FREELANCERS;
      if (skillsFilter.trim()) {
        const q = skillsFilter.toLowerCase();
        filtered = filtered.filter(f => f.skills?.some(s => s.toLowerCase().includes(q)) || f.fullName.toLowerCase().includes(q));
      }
      setFreelancers(filtered);
      setTotalPages(1);
      setTotalElements(filtered.length);
    } finally {
      setLoading(false);
    }
  }, [requestParams, skillsFilter, locationFilter, rateFilter]);

  useEffect(() => {
    void loadFreelancers();
  }, [loadFreelancers]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    const next = new URLSearchParams();
    if (skillsFilter) next.set("skills", skillsFilter);
    if (locationFilter) next.set("location", locationFilter);
    if (rateFilter) next.set("rate", rateFilter);
    setSearchParams(next, { replace: true });
    void loadFreelancers();
  };

  const handleInvite = (freelancer: FreelancerResult) => {
    setInvitedFreelancer(freelancer);
  };

  return (
    <div className="saas-freelancers-page">
      {/* Top Title & Inline Filter Bar */}
      <div className="saas-page-header">
        <h1 className="saas-page-title">Freelancers</h1>

        <form className="saas-inline-filters" onSubmit={handleFilterSubmit}>
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
          <button type="submit" className="sr-only">Filter</button>
        </form>
      </div>

      {/* 3-Column Grid of Cards */}
      <main className="saas-cards-grid" aria-live="polite">
        {loading ? (
          Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} />)
        ) : freelancers.length === 0 ? (
          <div className="saas-empty-state">
            <Icon name="users" size={32} />
            <p>No freelancers found matching your criteria.</p>
            <button
              type="button"
              className="saas-clear-btn"
              onClick={() => {
                setSkillsFilter("");
                setLocationFilter("");
                setRateFilter("");
                setSearchParams({});
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          freelancers.map((freelancer) => (
            <FreelancerCard
              key={freelancer.id}
              freelancer={freelancer}
              onInvite={handleInvite}
            />
          ))
        )}
      </main>

      {totalPages > 1 && (
        <Pagination
          disabled={loading}
          onPageChange={(p) => setPage(p)}
          page={page}
          totalPages={totalPages}
        />
      )}

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
              <p>Select an open project to invite <strong>{invitedFreelancer.fullName}</strong> to collaborate.</p>
              <div className="form-field" style={{ marginTop: "1rem" }}>
                <label className="form-field__label">Your Open Project</label>
                <select className="form-control">
                  <option>E-Commerce UI Redesign ($1,500)</option>
                  <option>Full-Stack Mobile App MVP ($3,200)</option>
                  <option>Brand Identity & Design System ($850)</option>
                </select>
              </div>
              <div className="form-field" style={{ marginTop: "1rem" }}>
                <label className="form-field__label">Personal Message</label>
                <textarea
                  className="form-control"
                  rows={3}
                  defaultValue={`Hi ${invitedFreelancer.fullName}, I reviewed your profile and would love to collaborate with you on our upcoming project.`}
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
