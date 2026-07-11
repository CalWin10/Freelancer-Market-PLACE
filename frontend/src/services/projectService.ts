import axios from "axios";
import {
  CreateProjectRequest,
  UpdateProjectRequest,
  PageResponse,
  Project,
} from "../types/project";

const API_URL = "http://localhost:8080/api/v1/projects";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const createProject = async (
  project: CreateProjectRequest
): Promise<Project> => {
  const response = await axios.post(API_URL, project, getAuthHeader());
  return response.data;
};

export const getMyProjects = async (
  page: number = 0,
  size: number = 10
): Promise<PageResponse<Project>> => {
  const response = await axios.get(
    `${API_URL}/my?page=${page}&size=${size}`,
    getAuthHeader()
  );

  return response.data;
};

export const updateProject = async (
  id: number,
  project: UpdateProjectRequest
): Promise<Project> => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    project,
    getAuthHeader()
  );

  return response.data;
};

export const deleteProject = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`, getAuthHeader());
};