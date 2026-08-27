import { useNavigate } from "react-router-dom";
import ProjectForm from "../../components/forms/ProjectForm";
import Card, { CardHeader } from "../../components/common/Card";
import Icon from "../../components/common/Icon";
import { useToast } from "../../context/ToastContext";
import type { CreateProjectRequest } from "../../types/project";
import { createProject } from "../../services/projectService";

const CreateProject = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleCreate = async (data: CreateProjectRequest) => {
    const project = await createProject(data);
    showToast({
      type: "success",
      title: "Project published",
      message: "Your project is now open for freelancer applications.",
    });
    navigate(`/projects/${project.id}`, { replace: true });
  };

  return (
    <div className="page-container page-container--narrow">
      <div className="page-header">
        <div>
          <span className="eyebrow"><Icon name="plus" size={15} /> New opportunity</span>
          <h1 className="page-title">Create a project</h1>
          <p className="page-subtitle">Give freelancers the context they need to send a thoughtful proposal.</p>
        </div>
      </div>

      <Card padding="lg">
        <CardHeader
          title="Project details"
          description="All required fields are marked with an asterisk. You can edit an open project later."
        />
        <ProjectForm
          onCancel={() => navigate("/projects/my")}
          onSubmit={handleCreate}
          submitLabel="Publish project"
        />
      </Card>
    </div>
  );
};

export default CreateProject;
