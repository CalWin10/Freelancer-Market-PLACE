import { Project } from "../../types/project";
import StatusBadge from "../common/StatusBadge";

type ProjectCardProps = {
  project: Project;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

const ProjectCard = ({
  project,
  onEdit,
  onDelete,
}: ProjectCardProps) => {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2>{project.title}</h2>

      <p>{project.description}</p>

      <p>
        <strong>Budget:</strong> ₹{project.budget}
      </p>

      <p>
        <strong>Required Skills:</strong> {project.requiredSkills}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        <StatusBadge status={project.status} />
      </p>

      <p>
        <strong>Created:</strong>{" "}
        {new Date(project.createdAt).toLocaleString()}
      </p>

      <div
        style={{
          marginTop: "15px",
          display: "flex",
          gap: "10px",
        }}
      >
        {(project.status === "OPEN" || project.status === "DRAFT") && (
          <>
            <button
              onClick={() => onEdit(project.id)}
              style={{
                background: "#007bff",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(project.id)}
              style={{
                background: "#dc3545",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;