import api from "./api";

export interface PortfolioItem {
  id?: number;
  title: string;
  description?: string;
  projectUrl?: string;
  imageUrl?: string;
}

export interface FreelancerProfile {
  id?: number;
  fullName?: string;
  email?: string;
  bio?: string;
  location?: string;
  hourlyRate?: number;
  skills?: string[];
  profilePhotoUrl?: string;
  portfolioItems?: PortfolioItem[];
}

export interface ClientProfile {
  id?: number;
  fullName?: string;
  email?: string;
  companyName?: string;
  contactName?: string;
  bio?: string;
  profilePhotoUrl?: string;
}

export const getFreelancerProfile = () =>
  api.get<FreelancerProfile>("/freelancers/me").then((r) => r.data);

export const updateFreelancerProfile = (data: FreelancerProfile) =>
  api.put<FreelancerProfile>("/freelancers/me", data).then((r) => r.data);

export const getClientProfile = () =>
  api.get<ClientProfile>("/clients/me").then((r) => r.data);

export const updateClientProfile = (data: ClientProfile) =>
  api.put<ClientProfile>("/clients/me", data).then((r) => r.data);

export const uploadPhoto = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post<string>("/users/me/photo", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

export const deletePhoto = () =>
  api.delete("/users/me/photo").then((r) => r.data);
