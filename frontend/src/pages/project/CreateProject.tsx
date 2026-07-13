import { useNavigate } from "react-router-dom";
import ProjectForm from "../../components/forms/ProjectForm";
import { CreateProjectRequest } from "../../types/project";
import { createProject } from "../../services/projectService";

const CreateProject = () => {
  const navigate = useNavigate();

  const handleCreate = async (data: CreateProjectRequest) => {
    try {
      await createProject(data);
      alert("Project created successfully!");
      navigate("/projects/my");
    } catch (error: any) {
      const msg = error.response?.data?.message ?? "Failed to create project.";
      const errors = error.response?.data?.errors;
      if (errors) {
        alert(Object.values(errors).join("\n"));
      } else {
        alert(msg);
      }
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <ProjectForm buttonText="Create Project" onSubmit={handleCreate} />
    </div>
  );
};

export default CreateProject;
