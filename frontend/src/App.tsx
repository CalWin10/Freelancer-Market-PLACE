import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import ClientProfile from "./pages/client/ClientProfile";
import Dashboard from "./pages/dashboard/Dashboard";
import FreelancerProfile from "./pages/freelancer/FreelancerProfile";
import LandingPage from "./pages/home/LandingPage";
import ProjectMessages from "./pages/messaging/Messages";
import NotFound from "./pages/NotFound";
import Profile from "./pages/profile/Profile";
import CreateProject from "./pages/project/CreateProject";
import EditProject from "./pages/project/EditProject";
import MyProjects from "./pages/project/MyProjects";
import ProjectDetail from "./pages/project/ProjectDetail";
import FreelancerSearch from "./pages/search/FreelancerSearch";
import ProjectSearch from "./pages/search/ProjectSearch";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import RoleRoute from "./routes/RoleRoute";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<AppShell />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/projects" element={<ProjectSearch />} />
        <Route path="/freelancers" element={<FreelancerSearch />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/projects/:id/messages" element={<ProjectMessages />} />
          <Route path="/profile" element={<Profile />} />

          <Route element={<RoleRoute allowedRoles={["CLIENT"]} />}>
            <Route path="/projects/my" element={<MyProjects />} />
            <Route path="/projects/create" element={<CreateProject />} />
            <Route path="/projects/edit/:id" element={<EditProject />} />
            <Route path="/profile/client" element={<ClientProfile />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["FREELANCER"]} />}>
            <Route path="/profile/freelancer" element={<FreelancerProfile />} />
          </Route>
        </Route>

        <Route path="/search/projects" element={<Navigate replace to="/projects" />} />
        <Route path="/search/freelancers" element={<Navigate replace to="/freelancers" />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

