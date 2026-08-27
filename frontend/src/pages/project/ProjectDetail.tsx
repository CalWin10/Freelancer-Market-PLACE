import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import Card, { CardHeader } from "../../components/common/Card";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Icon from "../../components/common/Icon";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import { Textarea } from "../../components/common/FormControls";
import DeleteProjectModal from "../../components/modals/DeleteProjectModal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  acceptApplication,
  applyToProject,
  getApplications,
  rejectApplication,
  type ApplicationResponse,
} from "../../services/applicationService";
import { getApiErrorMessage, getApiStatus } from "../../services/api";
import { deleteProject, getProject, updateProjectStatus } from "../../services/projectService";
import type { Project, ProjectStatus } from "../../types/project";
import { formatCurrency, formatDate, formatDateTime, formatStatus, truncate } from "../../utils/format";

interface ConfirmationState {
  kind: "accept" | "reject" | "status";
  application?: ApplicationResponse;
  status?: ProjectStatus;
}

const STATUS_ACTION_LABELS: Partial<Record<ProjectStatus, string>> = {
  IN_PROGRESS: "Start work",
  COMPLETED: "Mark completed",
  CANCELLED: "Cancel project",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [proposal, setProposal] = useState("");
  const [proposalError, setProposalError] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [applicationsError, setApplicationsError] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isClientOwner = Boolean(project && user?.role === "CLIENT" && project.clientEmail === user.email);
  const isAssignedFreelancer = Boolean(
    project && user?.role === "FREELANCER" && project.assignedFreelancerEmail === user.email,
  );

  const loadApplications = useCallback(async () => {
    if (!project || !user || user.role !== "CLIENT" || project.clientEmail !== user.email) return;
    setApplicationsError("");
    try {
      setApplications(await getApplications(projectId));
    } catch (requestError) {
      setApplicationsError(getApiErrorMessage(requestError, "Applications could not be loaded."));
    }
  }, [project, projectId, user]);

  const loadProject = useCallback(async () => {
    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
      setError("This project link is invalid.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await getProject(projectId);
      setProject(response);
      if (user?.role === "CLIENT" && response.clientEmail === user.email) {
        try {
          setApplications(await getApplications(projectId));
          setApplicationsError("");
        } catch (applicationsRequestError) {
          setApplicationsError(getApiErrorMessage(applicationsRequestError, "Applications could not be loaded."));
        }
      } else {
        setApplications([]);
      }
    } catch (requestError) {
      setProject(null);
      setError(getApiErrorMessage(requestError, "The project could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [projectId, user]);

  useEffect(() => { void loadProject(); }, [loadProject]);

  const skills = useMemo(() => project?.requiredSkills
    ?.split(",")
    .map((skill) => skill.trim())
    .filter(Boolean) ?? [], [project?.requiredSkills]);

  const allowedStatusActions = useMemo(() => {
    if (!project) return [];
    const isParticipant = isClientOwner || isAssignedFreelancer;
    return isParticipant ? project.allowedNextStatuses ?? [] : [];
  }, [isAssignedFreelancer, isClientOwner, project]);

  const handleApply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (applying || !project) return;
    if (proposal.length > 3000) {
      setProposalError("Proposal message must not exceed 3,000 characters.");
      return;
    }

    setApplying(true);
    setProposalError("");
    try {
      await applyToProject(project.id, proposal.trim());
      setHasApplied(true);
      setProposal("");
      showToast({ type: "success", title: "Proposal submitted", message: "The client can now review your application." });
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, "Your proposal could not be submitted.");
      if (getApiStatus(requestError) === 409) setHasApplied(true);
      setProposalError(message);
    } finally {
      setApplying(false);
    }
  };

  const executeConfirmation = async () => {
    if (!confirmation || actionLoading) return;
    setActionLoading(true);
    try {
      if (confirmation.kind === "accept" && confirmation.application) {
        await acceptApplication(confirmation.application.id);
        showToast({ type: "success", title: "Application accepted", message: `${confirmation.application.freelancerName} is now assigned to this project.` });
        await loadProject();
      } else if (confirmation.kind === "reject" && confirmation.application) {
        await rejectApplication(confirmation.application.id);
        showToast({ type: "success", title: "Application declined" });
        await loadApplications();
      } else if (confirmation.kind === "status" && confirmation.status) {
        const updated = await updateProjectStatus(projectId, confirmation.status);
        setProject(updated);
        showToast({ type: "success", title: "Project status updated", message: `The project is now ${formatStatus(confirmation.status).toLowerCase()}.` });
      }
      setConfirmation(null);
    } catch (requestError) {
      showToast({ type: "error", title: "Action failed", message: getApiErrorMessage(requestError, "Please try again.") });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project || deleting) return;
    setDeleting(true);
    try {
      await deleteProject(project.id);
      showToast({ type: "success", title: "Project deleted", message: `“${project.title}” was removed.` });
      navigate("/projects/my", { replace: true });
    } catch (requestError) {
      showToast({ type: "error", title: "Could not delete project", message: getApiErrorMessage(requestError, "Please try again.") });
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) return <Loader fullPage label="Loading project details" />;
  if (!project) {
    return (
      <div className="page-container page-container--narrow">
        <ErrorState
          action={<Link className="button button--secondary button--md" to="/projects">Browse projects</Link>}
          message={error || "The requested project was not found."}
          onRetry={loadProject}
          title="Project unavailable"
        />
      </div>
    );
  }

  const canEdit = isClientOwner && (project.status === "OPEN" || project.status === "DRAFT");
  const canMessage = isClientOwner || isAssignedFreelancer || hasApplied;
  const isOpen = project.status === "OPEN";
  const confirmationIsDestructive = confirmation?.kind === "reject" || confirmation?.status === "CANCELLED";
  const confirmationTitle = confirmation?.kind === "accept"
    ? "Accept this application?"
    : confirmation?.kind === "reject"
      ? "Decline this application?"
      : `${STATUS_ACTION_LABELS[confirmation?.status ?? "OPEN"] ?? "Update project"}?`;
  const confirmationDescription = confirmation?.kind === "accept"
    ? `Assign ${confirmation.application?.freelancerName ?? "this freelancer"} to the project? Other pending applications will be declined automatically.`
    : confirmation?.kind === "reject"
      ? `Decline ${confirmation.application?.freelancerName ?? "this freelancer"}’s application?`
      : confirmation?.status === "CANCELLED"
        ? "Cancel this project? This status change cannot be reversed through the current API."
        : `Change the project status to ${formatStatus(confirmation?.status).toLowerCase()}?`;

  return (
    <div className="page-container project-detail-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to={user?.role === "CLIENT" ? "/projects/my" : "/projects"}>Projects</Link>
        <Icon name="chevron-right" size={14} />
        <span aria-current="page">Project details</span>
      </nav>

      <div className="project-detail-layout">
        <main className="stack stack--lg">
          <Card className="project-overview" padding="lg">
            <div className="project-overview__header">
              <div>
                <div className="cluster cluster--sm project-overview__status">
                  <StatusBadge status={project.status} />
                  <span>Posted {formatDate(project.createdAt)}</span>
                </div>
                <h1>{project.title}</h1>
                <p className="project-overview__client">Posted by {project.clientEmail}</p>
              </div>
              {canEdit && (
                <div className="project-overview__actions">
                  <Button leftIcon={<Icon name="edit" size={16} />} onClick={() => navigate(`/projects/edit/${project.id}`)} size="sm" variant="secondary">Edit</Button>
                  <Button leftIcon={<Icon name="trash" size={16} />} onClick={() => setDeleteOpen(true)} size="sm" variant="ghost">Delete</Button>
                </div>
              )}
            </div>

            <div className="project-facts">
              <div><Icon name="dollar" size={19} /><span>Project budget<strong>{formatCurrency(project.budget)}</strong></span></div>
              <div><Icon name="calendar" size={19} /><span>Last updated<strong>{formatDate(project.updatedAt)}</strong></span></div>
              {project.assignedFreelancerName && <div><Icon name="user" size={19} /><span>Assigned to<strong>{project.assignedFreelancerName}</strong></span></div>}
            </div>

            <section className="project-copy">
              <h2>About this project</h2>
              <p>{project.description}</p>
            </section>

            <section className="project-copy">
              <h2>Skills and expertise</h2>
              {skills.length > 0 ? (
                <div className="tag-list">{skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div>
              ) : <p className="muted-text">No specific skills were listed.</p>}
            </section>

            {(allowedStatusActions.length > 0 || canMessage) && (
              <div className="project-primary-actions">
                {allowedStatusActions.map((status) => (
                  <Button
                    key={status}
                    leftIcon={<Icon name={status === "COMPLETED" ? "check" : status === "CANCELLED" ? "close" : "arrow-right"} size={16} />}
                    onClick={() => setConfirmation({ kind: "status", status })}
                    variant={status === "CANCELLED" ? "danger" : status === "COMPLETED" ? "success" : "primary"}
                  >
                    {STATUS_ACTION_LABELS[status] ?? formatStatus(status)}
                  </Button>
                ))}
                {canMessage && (
                  <Link className="button button--secondary button--md" to={`/projects/${project.id}/messages`}>
                    <Icon name="message" size={17} /> Project messages
                  </Link>
                )}
              </div>
            )}
          </Card>

          {user?.role === "FREELANCER" && (
            <Card padding="lg">
              <CardHeader title="Submit a proposal" description="Introduce yourself and explain how you would approach the work." />
              {!isOpen ? (
                <div className="inline-notice"><Icon name="info" size={18} /><span>This project is no longer accepting applications.</span></div>
              ) : hasApplied ? (
                <div className="inline-notice inline-notice--success">
                  <Icon name="check-circle" size={19} />
                  <div><strong>Application already submitted</strong><span>You can use project messages if access has been granted by your application.</span></div>
                </div>
              ) : (
                <form className="stack" onSubmit={handleApply} noValidate>
                  <Textarea
                    error={proposalError}
                    hint={`${proposal.length.toLocaleString()} / 3,000 characters · Optional`}
                    label="Cover letter"
                    maxLength={3000}
                    onChange={(event) => { setProposal(event.target.value); setProposalError(""); }}
                    placeholder="Share relevant experience, your proposed approach, and availability."
                    rows={7}
                    value={proposal}
                  />
                  <div className="form-actions form-actions--start">
                    <Button loading={applying} loadingText="Submitting proposal…" type="submit">Submit proposal</Button>
                  </div>
                </form>
              )}
            </Card>
          )}

          {isClientOwner && (
            <Card padding="lg">
              <CardHeader
                title={`Applications (${applications.length})`}
                description="Review real freelancer profiles and choose the best fit for this project."
                action={<Button leftIcon={<Icon name="refresh" size={16} />} onClick={loadApplications} size="sm" variant="ghost">Refresh</Button>}
              />
              {applicationsError ? (
                <ErrorState compact message={applicationsError} onRetry={loadApplications} title="Applications unavailable" />
              ) : applications.length === 0 ? (
                <EmptyState compact description="New proposals will appear here as freelancers apply." icon="users" title="No applications yet" />
              ) : (
                <div className="application-list">
                  {applications.map((application) => (
                    <article className="application-card" key={application.id}>
                      <div className="application-card__header">
                        <Avatar name={application.freelancerName} size="lg" src={application.freelancerPhotoUrl} />
                        <div className="application-card__identity">
                          <h3>{application.freelancerName}</h3>
                          <div className="application-card__meta">
                            {application.freelancerLocation && <span><Icon name="map-pin" size={14} /> {application.freelancerLocation}</span>}
                            {application.freelancerHourlyRate != null && <span><Icon name="dollar" size={14} /> {formatCurrency(application.freelancerHourlyRate)}/hr</span>}
                            <span><Icon name="clock" size={14} /> {formatDate(application.appliedAt)}</span>
                          </div>
                        </div>
                        <StatusBadge size="sm" status={application.status} />
                      </div>

                      {application.freelancerBio && <p className="application-card__bio">{truncate(application.freelancerBio, 230)}</p>}
                      {application.freelancerSkills && application.freelancerSkills.length > 0 && (
                        <div className="tag-list">{application.freelancerSkills.slice(0, 8).map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div>
                      )}
                      {application.message && (
                        <blockquote className="proposal-quote">
                          <span>Cover letter</span>
                          <p>{application.message}</p>
                        </blockquote>
                      )}

                      <div className="application-card__footer">
                        <span className="muted-text"><Icon name="mail" size={14} /> {application.freelancerEmail}</span>
                        {application.status === "PENDING" && isOpen && (
                          <div className="cluster cluster--sm">
                            <Button onClick={() => setConfirmation({ kind: "reject", application })} size="sm" variant="secondary">Decline</Button>
                            <Button leftIcon={<Icon name="check" size={15} />} onClick={() => setConfirmation({ kind: "accept", application })} size="sm" variant="success">Accept</Button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </Card>
          )}
        </main>

        <aside className="project-detail-sidebar">
          <Card>
            <h2 className="sidebar-card-title">Project activity</h2>
            {project.statusHistory && project.statusHistory.length > 0 ? (
              <ol className="status-timeline">
                {[...project.statusHistory].reverse().map((entry, index) => (
                  <li key={`${entry.changedAt}-${index}`}>
                    <span className="status-timeline__marker" />
                    <div>
                      <strong>{entry.fromStatus ? `${formatStatus(entry.fromStatus)} to ` : ""}{formatStatus(entry.toStatus)}</strong>
                      <span>{formatDateTime(entry.changedAt)}</span>
                      <small>{entry.changedByEmail}</small>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="sidebar-empty"><Icon name="clock" size={20} /><span>No status changes yet.</span></div>
            )}
          </Card>

          <Card>
            <h2 className="sidebar-card-title">At a glance</h2>
            <dl className="detail-list">
              <div><dt>Project ID</dt><dd>#{project.id}</dd></div>
              <div><dt>Created</dt><dd>{formatDate(project.createdAt)}</dd></div>
              <div><dt>Status</dt><dd>{formatStatus(project.status)}</dd></div>
              <div><dt>Budget</dt><dd>{formatCurrency(project.budget)}</dd></div>
            </dl>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        confirmLabel={confirmation?.kind === "accept" ? "Accept application" : confirmation?.kind === "reject" ? "Decline application" : STATUS_ACTION_LABELS[confirmation?.status ?? "OPEN"] ?? "Update status"}
        description={confirmationDescription}
        destructive={confirmationIsDestructive}
        loading={actionLoading}
        onCancel={() => !actionLoading && setConfirmation(null)}
        onConfirm={executeConfirmation}
        open={Boolean(confirmation)}
        title={confirmationTitle}
      />
      <DeleteProjectModal loading={deleting} onCancel={() => !deleting && setDeleteOpen(false)} onConfirm={handleDelete} open={deleteOpen} projectTitle={project.title} />
    </div>
  );
}
