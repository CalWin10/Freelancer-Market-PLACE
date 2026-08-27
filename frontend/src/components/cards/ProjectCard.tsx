import { Link } from "react-router-dom";
import type { ProjectSummary } from "../../types/project";
import { formatCurrency, formatDate, truncate } from "../../utils/format";
import Button from "../common/Button";
import Card from "../common/Card";
import Icon from "../common/Icon";
import StatusBadge from "../common/StatusBadge";

type ProjectCardProps = {
  project: ProjectSummary;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  deleting?: boolean;
  compact?: boolean;
};

const ProjectCard = ({ project, onEdit, onDelete, deleting = false, compact = false }: ProjectCardProps) => {
  const skills = project.requiredSkills
    ?.split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
  const canModify = project.status === "OPEN" || project.status === "DRAFT";

  return (
    <Card className={`project-card${compact ? " project-card--compact" : ""}`} interactive>
      <div className="project-card__header">
        <div className="project-card__heading">
          <Link className="project-card__title" to={`/projects/${project.id}`}>
            {project.title}
          </Link>
          <span className="project-card__date">
            <Icon name="calendar" size={15} />
            {formatDate(project.createdAt)}
          </span>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <p className="project-card__description">
        {truncate(project.description, compact ? 125 : 190)}
      </p>

      {skills && skills.length > 0 && (
        <div className="tag-list" aria-label="Required skills">
          {skills.slice(0, compact ? 3 : 5).map((skill) => (
            <span className="tag" key={skill}>{skill}</span>
          ))}
          {skills.length > (compact ? 3 : 5) && (
            <span className="tag tag--muted">+{skills.length - (compact ? 3 : 5)}</span>
          )}
        </div>
      )}

      <div className="project-card__footer">
        <span className="project-card__budget">
          <span className="project-card__meta-label">Budget</span>
          {formatCurrency(project.budget)}
        </span>
        <div className="project-card__actions">
          {canModify && onEdit && (
            <Button
              aria-label={`Edit ${project.title}`}
              leftIcon={<Icon name="edit" size={16} />}
              onClick={() => onEdit(project.id)}
              size="sm"
              variant="ghost"
            >
              Edit
            </Button>
          )}
          {canModify && onDelete && (
            <Button
              aria-label={`Delete ${project.title}`}
              disabled={deleting}
              leftIcon={<Icon name="trash" size={16} />}
              onClick={() => onDelete(project.id)}
              size="sm"
              variant="ghost"
            >
              Delete
            </Button>
          )}
          <Link className="button button--primary button--sm" to={`/projects/${project.id}`}>
            View details
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
