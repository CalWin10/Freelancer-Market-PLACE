import api, { compactParams } from "./api";
import {
  CreateProjectRequest,
  UpdateProjectRequest,
  PageResponse,
  Project,
  ProjectSummary,
  ProjectStatus,
} from "../types/project";

export const createProject = (project: CreateProjectRequest): Promise<Project> =>
  api.post("/projects", project).then((r) => r.data);

export const getMyProjects = (page = 0, size = 10): Promise<PageResponse<Project>> =>
  api.get("/projects/my", { params: { page, size } }).then((r) => r.data);

export const getProject = (id: number): Promise<Project> =>
  api.get(`/projects/${id}`).then((r) => r.data);

export const updateProject = (id: number, project: UpdateProjectRequest): Promise<Project> =>
  api.put(`/projects/${id}`, project).then((r) => r.data);

export const updateProjectStatus = (id: number, status: ProjectStatus): Promise<Project> =>
  api.put(`/projects/${id}/status`, { status }).then((r) => r.data);

export const deleteProject = (id: number): Promise<string> =>
  api.delete(`/projects/${id}`).then((r) => r.data);

export interface ProjectSearchParams {
  q?: string;
  skills?: string;
  status?: ProjectStatus | "";
  minBudget?: number | "";
  maxBudget?: number | "";
  page?: number;
  size?: number;
  sortBy?: "newest" | "budgetAsc" | "budgetDesc";
}

export const searchProjects = (
  params: ProjectSearchParams,
): Promise<PageResponse<ProjectSummary>> =>
  api.get("/projects/search", { params: compactParams(params) }).then((r) => r.data);
