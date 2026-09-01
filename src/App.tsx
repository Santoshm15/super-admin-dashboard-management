import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardPage from "./pages/Dashboard/DashboardPage";
import UsersPage from "./pages/Users/UsersPage";
import UserDetailsPage from "./pages/Users/UserDetailsPage";
import TenantsPage from "./pages/Tenants/TenantsPage";
import TenantDetailsPage from "./pages/Tenants/TenantDetailsPage";

import "./App.css";

function App() {
  return (
    <BrowserRouter basename="/super-admin-dashboard-application">
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:id" element={<UserDetailsPage />} />

        <Route path="/tenants" element={<TenantsPage />} />
        <Route path="/tenants/:id" element={<TenantDetailsPage />} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
