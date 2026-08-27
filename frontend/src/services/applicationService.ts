import api from "./api";

export interface ApplicationResponse {
  id: number;
  projectId: number;
  projectTitle: string;
  freelancerId: number;
  freelancerName: string;
  freelancerEmail: string;
  freelancerLocation?: string;
  freelancerHourlyRate?: number;
  freelancerSkills?: string[];
  freelancerPhotoUrl?: string;
  freelancerBio?: string;
  message?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  appliedAt: string;
}

export const applyToProject = (projectId: number, message: string): Promise<ApplicationResponse> =>
  api.post(`/projects/${projectId}/apply`, { message }).then((r) => r.data);

export const getApplications = (projectId: number): Promise<ApplicationResponse[]> =>
  api.get(`/projects/${projectId}/applications`).then((r) => r.data);

export const acceptApplication = (applicationId: number): Promise<ApplicationResponse> =>
  api.put(`/applications/${applicationId}/accept`, {}).then((r) => r.data);

export const rejectApplication = (applicationId: number): Promise<ApplicationResponse> =>
  api.put(`/applications/${applicationId}/reject`, {}).then((r) => r.data);
