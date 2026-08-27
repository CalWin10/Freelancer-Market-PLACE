import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProjectForm from "../../components/forms/ProjectForm";
import Card, { CardHeader } from "../../components/common/Card";
import ErrorState from "../../components/common/ErrorState";
import Icon from "../../components/common/Icon";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../services/api";
import type { Project, UpdateProjectRequest } from "../../types/project";
import { getProject, updateProject } from "../../services/projectService";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const projectId = Number(id);

  const loadProject = useCallback(async () => {
    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
      setError("This project link is invalid.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      setProject(await getProject(projectId));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "The project could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { void loadProject(); }, [loadProject]);

  const handleUpdate = async (data: UpdateProjectRequest) => {
    await updateProject(projectId, data);
    showToast({ type: "success", title: "Project updated", message: "Your changes are now live." });
    navigate(`/projects/${projectId}`, { replace: true });
  };

  if (loading) return <Loader fullPage label="Loading project" />;
  if (!project) {
    return (
      <div className="page-container page-container--narrow">
        <ErrorState
          action={<button className="button button--secondary button--md" onClick={() => navigate("/projects/my")}>Back to my projects</button>}
          message={error || "The requested project was not found."}
          onRetry={loadProject}
          title="Unable to edit project"
        />
      </div>
    );
  }

  return (
    <div className="page-container page-container--narrow">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Icon name="edit" size={15} /> Project settings</span>
          <h1 className="page-title">Edit project</h1>
          <p className="page-subtitle">Keep the scope and expectations clear for prospective freelancers.</p>
        </div>
      </div>

      <Card padding="lg">
        <CardHeader title="Project details" description={`Editing “${project.title}”`} />
        <ProjectForm
          initialData={project}
          onCancel={() => navigate(`/projects/${projectId}`)}
          onSubmit={handleUpdate}
          submitLabel="Save changes"
        />
      </Card>
    </div>
  );
};

export default EditProject;
