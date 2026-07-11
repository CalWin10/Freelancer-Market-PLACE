import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProjectForm from "../../components/forms/ProjectForm";
import {
  CreateProjectRequest,
  Project,
} from "../../types/project";
import {
  getMyProjects,
  updateProject,
} from "../../services/projectService";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await getMyProjects();

        const foundProject = response.content.find(
          (p) => p.id === Number(id)
        );

        if (!foundProject) {
          alert("Project not found.");
          navigate("/projects/my");
          return;
        }

        setProject(foundProject);
      } catch (error) {
        console.error(error);
        alert("Failed to load project.");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, navigate]);

  const handleUpdate = async (data: CreateProjectRequest) => {
    if (!id) return;

    try {
      await updateProject(Number(id), data);

      alert("Project updated successfully!");

      navigate("/projects/my");
    } catch (error) {
      console.error(error);
      alert("Failed to update project.");
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!project) {
    return <h2>Project not found.</h2>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <ProjectForm
        initialData={{
          title: project.title,
          description: project.description,
          budget: project.budget,
          requiredSkills: project.requiredSkills,
        }}
        buttonText="Update Project"
        onSubmit={handleUpdate}
      />
    </div>
  );
};

export default EditProject;