import api from "./api";

export const getAdminDashboard = (): Promise<string> =>
  api.get<string>("/admin/dashboard").then((response) => response.data);
