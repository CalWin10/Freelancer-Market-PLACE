export interface Project {
  id: number;
  title: string;
  description: string;
  budget: number;
  requiredSkills: string;
  status: "OPEN" | "DRAFT" | "ASSIGNED" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
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
}