import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectCard from "../../components/cards/ProjectCard";
import { Project } from "../../types/project";
import { deleteProject, getMyProjects } from "../../services/projectService";

const MyProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadProjects = async () => {
    try {
      const response = await getMyProjects();
      setProjects(response.content);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to load projects.");
    }
  };

  useEffect(() => { loadProjects(); }, []);

  const handleEdit = (id: number) => navigate(`/projects/edit/${id}`);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id);
      loadProjects();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Failed to delete project.");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>My Projects</h1>

      <button
        onClick={() => navigate("/projects/create")}
        style={{ marginBottom: "20px", padding: "10px 20px", cursor: "pointer" }}
      >
        + Create New Project
      </button>

      {error && <p style={{ color: "#e53e3e" }}>{error}</p>}

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))
      )}
    </div>
  );
};

export default MyProjects;
