import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import CreateProject from "./pages/project/CreateProject";
import MyProjects from "./pages/project/MyProjects";
import EditProject from "./pages/project/EditProject";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to My Projects */}
        <Route path="/" element={<Navigate to="/projects/my" replace />} />

        {/* Project Routes */}
        <Route path="/projects/create" element={<CreateProject />} />
        <Route path="/projects/my" element={<MyProjects />} />
        <Route path="/projects/edit/:id" element={<EditProject />} />

        {/* 404 */}
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;