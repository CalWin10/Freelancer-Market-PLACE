import api, { compactParams } from "./api";
import { PageResponse } from "../types/project";

export interface FreelancerResult {
  id: number;
  fullName: string;
  email: string;
  bio?: string;
  location?: string;
  hourlyRate?: number;
  skills?: string[];
  profilePhotoUrl?: string;
}

export interface FreelancerSearchParams {
  skills?: string;
  location?: string;
  minRate?: number | "";
  maxRate?: number | "";
  page?: number;
  size?: number;
  sortBy?: string;
}

export const searchFreelancers = (p: FreelancerSearchParams): Promise<PageResponse<FreelancerResult>> =>
  api.get("/freelancers/search", { params: compactParams(p) }).then((r) => r.data);
