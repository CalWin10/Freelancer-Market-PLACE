export type ProjectStatus =
  | "OPEN"
  | "DRAFT"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface StatusHistoryEntry {
  fromStatus: ProjectStatus | null;
  toStatus: ProjectStatus;
  changedByEmail: string;
  changedAt: string;
}

export interface ProjectSummary {
  id: number;
  title: string;
  description: string;
  budget: number;
  requiredSkills?: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Project extends ProjectSummary {
  clientId: number;
  clientEmail: string;
  assignedFreelancerId: number | null;
  assignedFreelancerName: string | null;
  assignedFreelancerEmail: string | null;
  allowedNextStatuses?: ProjectStatus[] | null;
  statusHistory?: StatusHistoryEntry[] | null;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  budget: number;
  requiredSkills: string;
}

export interface UpdateProjectRequest {
  title: string;
  description: string;
  budget: number;
  requiredSkills: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}
