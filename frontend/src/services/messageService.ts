import api from "./api";

export interface MessageResponse {
  id: number;
  projectId: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  content: string;
  sentAt: string;
}

export const getMessages = (projectId: number): Promise<MessageResponse[]> =>
  api.get(`/projects/${projectId}/messages`).then((r) => r.data);

export const sendMessage = (projectId: number, content: string): Promise<MessageResponse> =>
  api.post(`/projects/${projectId}/messages`, { content }).then((r) => r.data);
