import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function Callback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      console.log("Callback: Starting auth callback handler");
      const { data, error } = await supabase.auth.getSession();

      console.log("Callback: Session data:", data);
      console.log("Callback: Error:", error);

      if (error) {
        console.error("Callback: Auth error:", error);
        setError(error.message);
        return;
      }

      if (data.session) {
        console.log("Callback: Session found, user:", data.session.user);
        
        // Get the role from localStorage (set before OAuth redirect)
        const pendingRole = localStorage.getItem("pending_oauth_role") || "tutor";
        console.log("Callback: Pending role from localStorage:", pendingRole);
        localStorage.removeItem("pending_oauth_role");

        // Check if user already has a role in metadata
        let role = data.session.user.user_metadata?.role;
        console.log("Callback: Current role in metadata:", role);

        // If no role exists, update the user metadata with the selected role
        if (!role) {
          console.log("Callback: Updating user metadata with role:", pendingRole);
          const { error: updateError } = await supabase.auth.updateUser({
            data: { role: pendingRole }
          });

          if (updateError) {
            console.error("Callback: Failed to update user role:", updateError);
          } else {
            console.log("Callback: Successfully updated user role");
          }

          role = pendingRole;
        }

        // CRITICAL: Call backend to sync user to database
        try {
          const API_BASE = import.meta.env.VITE_API_URL || "/api";
          console.log("Callback: Syncing user to backend database...");
          const response = await fetch(`${API_BASE}/auth/callback`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Callback: Backend sync failed:", errorData);
            throw new Error(errorData.error || "Failed to sync user to database");
          }

          const backendData = await response.json();
          console.log("Callback: Backend sync successful:", backendData);
        } catch (syncError: any) {
          console.error("Callback: Error syncing to backend:", syncError);
          setError(`Database sync failed: ${syncError.message}`);
          return;
        }

        // Redirect to appropriate dashboard
        const redirect = role === "tutor" ? "/tutor" : role === "agency" ? "/agency" : role === "parent" ? "/parent" : "/admin";
        console.log("Callback: Redirecting to:", redirect);
        navigate(redirect, { replace: true });
      } else {
        console.log("Callback: No session found, redirecting to login");
        // No session - redirect to login
        navigate("/login", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#000" }}>
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ background: "#22C55E", color: "black" }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#000" }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-400">Signing you in...</p>
      </div>
    </div>
  );
}
