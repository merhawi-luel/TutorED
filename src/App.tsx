import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/public/Landing";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import TutorDashboard from "@/pages/tutor/TutorDashboard";
import AgencyDashboard from "@/pages/agency/AgencyDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Tutor Routes */}
        <Route path="/tutor/*" element={<TutorDashboard />} />

        {/* Agency Routes */}
        <Route path="/agency/*" element={<AgencyDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
