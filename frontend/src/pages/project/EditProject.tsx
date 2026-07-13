import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProjectForm from "../../components/forms/ProjectForm";
import { Project, UpdateProjectRequest } from "../../types/project";
import { getProject, updateProject } from "../../services/projectService";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProject(Number(id))
      .then(setProject)
      .catch(() => { alert("Failed to load project."); navigate("/projects/my"); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleUpdate = async (data: UpdateProjectRequest) => {
    try {
      await updateProject(Number(id), data);
      alert("Project updated successfully!");
      navigate("/projects/my");
    } catch (error: any) {
      alert(error.response?.data?.message ?? "Failed to update project.");
    }
  };

  if (loading) return <h2>Loading...</h2>;
  if (!project) return <h2>Project not found.</h2>;

  return (
    <div style={{ padding: "30px" }}>
      <ProjectForm
        initialData={project}
        buttonText="Update Project"
        onSubmit={handleUpdate}
      />
    </div>
  );
};

export default EditProject;