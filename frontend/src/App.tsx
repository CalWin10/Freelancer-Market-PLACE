import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import CreateProject from "./pages/project/CreateProject";
import MyProjects from "./pages/project/MyProjects";
import EditProject from "./pages/project/EditProject";
import FreelancerProfile from "./pages/freelancer/FreelancerProfile";
import ClientProfile from "./pages/client/ClientProfile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/projects/my" replace />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Projects */}
        <Route path="/projects/create" element={<CreateProject />} />
        <Route path="/projects/my" element={<MyProjects />} />
        <Route path="/projects/edit/:id" element={<EditProject />} />

        {/* Profiles */}
        <Route path="/profile/freelancer" element={<FreelancerProfile />} />
        <Route path="/profile/client" element={<ClientProfile />} />

        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
