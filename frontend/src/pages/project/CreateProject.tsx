import { useNavigate } from "react-router-dom";
import ProjectForm from "../../components/forms/ProjectForm";
import {
  CreateProjectRequest,
} from "../../types/project";
import { createProject } from "../../services/projectService";

const CreateProject = () => {
  const navigate = useNavigate();

  const handleCreate = async (data: CreateProjectRequest) => {
    try {
      await createProject(data);

      alert("Project created successfully!");

      navigate("/projects/my");
    } catch (error) {
      console.error(error);
      alert("Failed to create project.");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <ProjectForm
        buttonText="Create Project"
        onSubmit={handleCreate}
      />
    </div>
  );
};

export default CreateProject;