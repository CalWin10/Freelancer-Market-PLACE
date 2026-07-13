import api from "./api";
import {
  CreateProjectRequest,
  UpdateProjectRequest,
  PageResponse,
  Project,
} from "../types/project";

export const createProject = (project: CreateProjectRequest): Promise<Project> =>
  api.post("/projects", project).then((r) => r.data);

export const getMyProjects = (page = 0, size = 10): Promise<PageResponse<Project>> =>
  api.get(`/projects/my?page=${page}&size=${size}`).then((r) => r.data);

export const getProject = (id: number): Promise<Project> =>
  api.get(`/projects/${id}`).then((r) => r.data);

export const updateProject = (id: number, project: UpdateProjectRequest): Promise<Project> =>
  api.put(`/projects/${id}`, project).then((r) => r.data);

export const deleteProject = (id: number): Promise<void> =>
  api.delete(`/projects/${id}`).then((r) => r.data);
