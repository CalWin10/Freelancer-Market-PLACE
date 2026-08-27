import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProjectCard from "../../components/cards/ProjectCard";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { Input, Select } from "../../components/common/FormControls";
import Icon from "../../components/common/Icon";
import { SkeletonCard } from "../../components/common/Loader";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/common/SearchBar";
import { getApiErrorMessage } from "../../services/api";
import { searchProjects, type ProjectSearchParams } from "../../services/projectService";
import type { ProjectStatus, ProjectSummary } from "../../types/project";

const PAGE_SIZE = 9;
const readPage = (params: URLSearchParams) => {
  const requestedPage = Number(params.get("page"));
  return Number.isInteger(requestedPage) && requestedPage >= 0 ? requestedPage : 0;
};
const PROJECT_STATUSES: Array<{ value: ProjectStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "OPEN", label: "Open" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "DRAFT", label: "Draft" },
];

interface ProjectFilters {
  q: string;
  skills: string;
  status: ProjectStatus | "";
  minBudget: string;
  maxBudget: string;
  sortBy: "newest" | "budgetAsc" | "budgetDesc";
}

const readFilters = (params: URLSearchParams): ProjectFilters => {
  const requestedStatus = params.get("status")?.toUpperCase() ?? "";
  const status = PROJECT_STATUSES.some((option) => option.value === requestedStatus)
    ? requestedStatus as ProjectStatus | ""
    : "";
  const requestedSort = params.get("sortBy");
  const sortBy = requestedSort === "budgetAsc" || requestedSort === "budgetDesc"
    ? requestedSort
    : "newest";

  return {
    q: params.get("q") ?? "",
    skills: params.get("skills") ?? "",
    status,
    minBudget: params.get("minBudget") ?? "",
    maxBudget: params.get("maxBudget") ?? "",
    sortBy,
  };
};

export default function ProjectSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilters = useMemo(() => readFilters(searchParams), []);
  const [draftFilters, setDraftFilters] = useState<ProjectFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<ProjectFilters>(initialFilters);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [page, setPage] = useState(readPage(searchParams));
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");

  const requestParams = useMemo<ProjectSearchParams>(() => ({
    q: appliedFilters.q.trim() || undefined,
    skills: appliedFilters.skills.trim() || undefined,
    status: appliedFilters.status,
    minBudget: appliedFilters.minBudget === "" ? "" : Number(appliedFilters.minBudget),
    maxBudget: appliedFilters.maxBudget === "" ? "" : Number(appliedFilters.maxBudget),
    sortBy: appliedFilters.sortBy,
    page,
    size: PAGE_SIZE,
  }), [appliedFilters, page]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await searchProjects(requestParams);
      setProjects(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Projects could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [requestParams]);

  useEffect(() => { void loadProjects(); }, [loadProjects]);

  const syncUrl = (filters: ProjectFilters, nextPage: number) => {
    const next = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) next.set(key, value);
    });
    if (nextPage > 0) next.set("page", String(nextPage));
    setSearchParams(next, { replace: true });
  };

  const applyFilters = (event?: React.FormEvent) => {
    event?.preventDefault();
    const minimum = draftFilters.minBudget === "" ? null : Number(draftFilters.minBudget);
    const maximum = draftFilters.maxBudget === "" ? null : Number(draftFilters.maxBudget);

    if (
      (minimum !== null && (!Number.isFinite(minimum) || minimum < 0)) ||
      (maximum !== null && (!Number.isFinite(maximum) || maximum < 0))
    ) {
      setFilterError("Budget values must be valid non-negative amounts.");
      return;
    }
    if (minimum !== null && maximum !== null && minimum > maximum) {
      setFilterError("Minimum budget cannot be greater than maximum budget.");
      return;
    }

    setFilterError("");
    setPage(0);
    setAppliedFilters(draftFilters);
    syncUrl(draftFilters, 0);
  };

  const clearFilters = () => {
    const cleared: ProjectFilters = {
      q: "", skills: "", status: "", minBudget: "", maxBudget: "", sortBy: "newest",
    };
    setDraftFilters(cleared);
    setAppliedFilters(cleared);
    setFilterError("");
    setPage(0);
    setSearchParams({}, { replace: true });
  };

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    syncUrl(appliedFilters, nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilterCount = [
    appliedFilters.skills, appliedFilters.status, appliedFilters.minBudget, appliedFilters.maxBudget,
  ].filter(Boolean).length;

  return (
    <div className="page-container">
      <div className="page-header page-header--search">
        <div>
          <span className="eyebrow"><Icon name="search" size={15} /> Opportunity marketplace</span>
          <h1 className="page-title">Find your next project</h1>
          <p className="page-subtitle">Search live backend listings by scope, skills, budget, and status.</p>
        </div>
      </div>

      <SearchBar
        className="search-bar--hero"
        label="Search projects by keyword"
        loading={loading}
        onChange={(q) => setDraftFilters((current) => ({ ...current, q }))}
        onSearch={() => applyFilters()}
        placeholder="Search project titles or descriptions"
        value={draftFilters.q}
      />

      <div className="results-layout">
        <aside className="filter-panel" aria-label="Project filters">
          <div className="filter-panel__header">
            <div className="cluster cluster--sm">
              <Icon name="filter" size={18} />
              <h2>Filters</h2>
              {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
            </div>
            {activeFilterCount > 0 && <button className="text-button" type="button" onClick={clearFilters}>Clear</button>}
          </div>

          <form className="stack" onSubmit={applyFilters}>
            <Input
              label="Required skills"
              onChange={(event) => setDraftFilters((current) => ({ ...current, skills: event.target.value }))}
              placeholder="React, Java, design"
              value={draftFilters.skills}
            />
            <Select
              label="Project status"
              onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value as ProjectStatus | "" }))}
              value={draftFilters.status}
            >
              {PROJECT_STATUSES.map((option) => <option key={option.value || "all"} value={option.value}>{option.label}</option>)}
            </Select>
            <div className="form-grid form-grid--two">
              <Input label="Minimum budget" min="0" onChange={(event) => setDraftFilters((current) => ({ ...current, minBudget: event.target.value }))} placeholder="500" step="0.01" type="number" value={draftFilters.minBudget} />
              <Input label="Maximum budget" min="0" onChange={(event) => setDraftFilters((current) => ({ ...current, maxBudget: event.target.value }))} placeholder="10000" step="0.01" type="number" value={draftFilters.maxBudget} />
            </div>
            <Select
              label="Sort by"
              onChange={(event) => setDraftFilters((current) => ({ ...current, sortBy: event.target.value as ProjectFilters["sortBy"] }))}
              value={draftFilters.sortBy}
            >
              <option value="newest">Newest first</option>
              <option value="budgetAsc">Budget: low to high</option>
              <option value="budgetDesc">Budget: high to low</option>
            </Select>
            {filterError && <p className="form-error" role="alert">{filterError}</p>}
            <Button fullWidth leftIcon={<Icon name="filter" size={16} />} type="submit">Apply filters</Button>
          </form>
        </aside>

        <main className="results-panel" aria-live="polite">
          <div className="results-toolbar">
            <div>
              <h2>Projects</h2>
              <p>{loading ? "Searching…" : `${totalElements.toLocaleString()} result${totalElements === 1 ? "" : "s"}`}</p>
            </div>
          </div>

          {error ? (
            <ErrorState compact message={error} onRetry={loadProjects} title="Search unavailable" />
          ) : loading ? (
            <div className="content-grid content-grid--projects">
              {Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} />)}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState action={<Button onClick={clearFilters} variant="secondary">Clear all filters</Button>} description="Try a broader keyword, another skill, or a wider budget range." icon="search" title="No matching projects" />
          ) : (
            <>
              <div className="content-grid content-grid--projects">
                {projects.map((project) => <ProjectCard compact key={project.id} project={project} />)}
              </div>
              <Pagination disabled={loading} onPageChange={changePage} page={page} totalPages={totalPages} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
