import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import Landing from "@/pages/public/Landing";
import VacanciesBrowse from "@/pages/public/VacanciesBrowse";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import TutorDashboard from "@/pages/tutor/TutorDashboard";
import AgencyDashboard from "@/pages/agency/AgencyDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ParentDashboard from "@/pages/parent/ParentDashboard";
import Callback from "@/pages/auth/Callback";
import Confirm from "@/pages/auth/Confirm";
import type { ReactNode } from "react";

// ─── Protected Route ───────────────────────────────────────────

function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the correct dashboard for their role
    const fallback = user.role === "tutor" ? "/tutor" : user.role === "agency" ? "/agency" : user.role === "parent" ? "/parent" : "/admin";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

// ─── Public-only Route (redirect if already logged in) ─────────

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (user) {
    const redirect = user.role === "tutor" ? "/tutor" : user.role === "agency" ? "/agency" : user.role === "parent" ? "/parent" : "/admin";
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}

// ─── App Routes ────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />

      {/* Auth — redirect to dashboard if already logged in */}
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/auth/callback" element={<Callback />} />
      <Route path="/auth/confirm" element={<Confirm />} />
      <Route path="/vacancies" element={<VacanciesBrowse />} />


      {/* Tutor Dashboard */}
      <Route
        path="/tutor/*"
        element={
          <ProtectedRoute allowedRoles={["tutor"]}>
            <TutorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Agency Dashboard */}
      <Route
        path="/agency/*"
        element={
          <ProtectedRoute allowedRoles={["agency"]}>
            <AgencyDashboard />
          </ProtectedRoute>
        }
      />

      {/* Parent Dashboard */}
      <Route
        path="/parent/*"
        element={
          <ProtectedRoute allowedRoles={["parent"]}>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── Root App ──────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
