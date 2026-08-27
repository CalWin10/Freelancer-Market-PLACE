import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectCard from "../../components/cards/ProjectCard";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Icon from "../../components/common/Icon";
import Pagination from "../../components/common/Pagination";
import { SkeletonCard } from "../../components/common/Loader";
import DeleteProjectModal from "../../components/modals/DeleteProjectModal";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../services/api";
import type { Project } from "../../types/project";
import { deleteProject, getMyProjects } from "../../services/projectService";

const PAGE_SIZE = 6;

const MyProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getMyProjects(page, PAGE_SIZE);
      setProjects(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Your projects could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { void loadProjects(); }, [loadProjects]);

  const handleEdit = (id: number) => navigate(`/projects/edit/${id}`);

  const handleDelete = async () => {
    if (!projectToDelete || deleting) return;
    setDeleting(true);
    try {
      await deleteProject(projectToDelete.id);
      showToast({ type: "success", title: "Project deleted", message: `“${projectToDelete.title}” was removed.` });
      setProjectToDelete(null);
      if (projects.length === 1 && page > 0) setPage((current) => current - 1);
      else await loadProjects();
    } catch (requestError) {
      showToast({ type: "error", title: "Could not delete project", message: getApiErrorMessage(requestError, "Please try again.") });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Icon name="briefcase" size={15} /> Client workspace</span>
          <h1 className="page-title">My projects</h1>
          <p className="page-subtitle">
            {loading ? "Loading your project portfolio…" : `${totalElements.toLocaleString()} project${totalElements === 1 ? "" : "s"} in your workspace`}
          </p>
        </div>
        <Button leftIcon={<Icon name="plus" size={17} />} onClick={() => navigate("/projects/create")}>
          Create project
        </Button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={loadProjects} title="Projects unavailable" />
      ) : loading ? (
        <div className="content-grid content-grid--projects" aria-label="Loading projects">
          {Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          action={<Button leftIcon={<Icon name="plus" size={17} />} onClick={() => navigate("/projects/create")}>Create your first project</Button>}
          description="Describe what you need and start receiving proposals from skilled freelancers."
          icon="briefcase"
          title="No projects yet"
        />
      ) : (
        <>
          <div className="content-grid content-grid--projects">
            {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEdit}
                onDelete={() => setProjectToDelete(project)}
                deleting={deleting && projectToDelete?.id === project.id}
          />
            ))}
          </div>
          <Pagination disabled={loading} onPageChange={setPage} page={page} totalPages={totalPages} />
        </>
      )}

      <DeleteProjectModal
        loading={deleting}
        onCancel={() => !deleting && setProjectToDelete(null)}
        onConfirm={handleDelete}
        open={Boolean(projectToDelete)}
        projectTitle={projectToDelete?.title}
      />
    </div>
  );
};

export default MyProjects;
