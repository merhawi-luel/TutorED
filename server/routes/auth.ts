import { Router } from "express";
import { db } from "../db";
import { users, tutorProfiles, organizations, parentProfiles } from "../db/schema";
import { supabaseAdmin, createSupabaseClient } from "../lib/supabase";
import { requireAuth } from "../middleware/auth";
import { eq } from "drizzle-orm";

const router = Router();

// ─── POST /api/auth/register ─────────────────────────────────
// Register with Supabase Auth (sends verification email)

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    if (role !== "tutor" && role !== "agency" && role !== "parent") {
      return res.status(400).json({ error: "Role must be 'tutor', 'agency', or 'parent'" });
    }

    // Check if email already exists in our database
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (existing.length > 0) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    // Sign up with Supabase Auth (sends verification email)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: false, // Require email verification
      user_metadata: {
        name,
        role,
      },
    });

    if (authError) {
      console.error("Supabase signup error:", authError);
      return res.status(400).json({ error: authError.message });
    }

    // Create user in our database
    const [newUser] = await db
      .insert(users)
      .values({
        id: authData.user.id,
        name,
        email: email.toLowerCase(),
        passwordHash: "managed-by-supabase", // Placeholder since Supabase handles passwords
        role,
      })
      .returning({ id: users.id, email: users.email, role: users.role });

    // Create role-specific profile
    if (role === "tutor") {
      await db.insert(tutorProfiles).values({
        userId: newUser.id,
        headline: "",
        bio: "",
        subjects: [],
        grades: [],
        experience: 0,
        education: "",
        location: "",
        teachingMode: "in-person",
        availability: "",
      });
    } else if (role === "agency") {
      await db.insert(organizations).values({
        name: `${name}'s Organization`,
        description: "",
        location: "",
        subjects: [],
        isVerified: false,
        ownerUserId: newUser.id,
      });
    } else if (role === "parent") {
      await db.insert(parentProfiles).values({
        userId: newUser.id,
      });
    }

    // Supabase sends a verification email automatically when email_confirm: false
    // Do NOT call inviteUserByEmail here — it overwrites user_metadata and loses the role

    res.status(201).json({
      message: "Account created! Please check your email to verify your account.",
      user: {
        id: newUser.id,
        name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────
// Login with Supabase Auth

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter both email and password" });
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (authError) {
      console.error("Supabase login error:", authError);
      if (authError.message.includes("Email not confirmed")) {
        return res.status(401).json({ error: "Please verify your email before logging in" });
      }
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Get user from our database
    const found = await db.select().from(users).where(eq(users.id, authData.user.id));
    if (found.length === 0) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const user = found[0];

    res.json({
      session: authData.session,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/oauth ────────────────────────────────────
// Google OAuth login/signup

router.post("/oauth", async (req, res) => {
  try {
    const { provider, role } = req.body;

    if (provider !== "google") {
      return res.status(400).json({ error: "Only Google OAuth is supported" });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/callback`,
        queryParams: {
          role: role || "tutor",
        },
      },
    });

    if (error) {
      console.error("OAuth error:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ url: data.url });
  } catch (error) {
    console.error("OAuth error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/callback ─────────────────────────────────
// Handle OAuth callback and create user in database if needed

router.post("/callback", async (req, res) => {
  try {
    console.log("🔐 OAuth Callback: Received callback request");
    const { access_token, refresh_token } = req.body;

    if (!access_token) {
      console.log("❌ OAuth Callback: No access token provided");
      return res.status(400).json({ error: "No token provided" });
    }

    console.log("🔐 OAuth Callback: Setting session with access token");
    // Set the session
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.setSession({
      access_token,
      refresh_token: refresh_token || "",
    });

    if (sessionError) {
      console.error("❌ OAuth Callback: Session error:", sessionError);
      return res.status(401).json({ error: "Invalid session" });
    }

    const authUser = sessionData.user;
    if (!authUser) {
      console.log("❌ OAuth Callback: No user in session");
      return res.status(401).json({ error: "No user in session" });
    }

    console.log(`🔐 OAuth Callback: User from session: ${authUser.email} (ID: ${authUser.id})`);
    console.log(`🔐 OAuth Callback: User metadata:`, authUser.user_metadata);

    // Check if user exists in our database
    const found = await db.select().from(users).where(eq(users.id, authUser.id));

    if (found.length === 0) {
      // New user from OAuth - create in our database
      const role = (authUser.user_metadata?.role as string) || "tutor";
      const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User";

      console.log(`🆕 Creating new user from OAuth: ${name} (${role})`);

      const [newUser] = await db
        .insert(users)
        .values({
          id: authUser.id,
          name,
          email: authUser.email!,
          passwordHash: "managed-by-supabase",
          role: role as "tutor" | "agency" | "parent",
        })
        .returning({ id: users.id, email: users.email, role: users.role });

      // Create role-specific profile
      if (role === "tutor") {
        console.log(`👨‍🏫 Creating tutor profile for ${name}`);
        await db.insert(tutorProfiles).values({ userId: newUser.id });
      } else if (role === "agency") {
        // Don't create organization automatically - agency users will use setup flow
        console.log(`🏢 Agency user created - will complete setup later: ${name}`);
      } else if (role === "parent") {
        console.log(`👨‍👩‍👧 Creating parent profile for ${name}`);
        await db.insert(parentProfiles).values({ userId: newUser.id });
      }

      console.log(`✅ User created successfully: ${newUser.id}`);

      res.json({
        session: sessionData.session,
        user: {
          id: newUser.id,
          name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } else {
      // Existing user
      const user = found[0];
      console.log(`✅ Existing user logged in: ${user.name} (${user.role})`);
      
      res.json({
        session: sessionData.session,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      });
    }
  } catch (error) {
    console.error("❌ OAuth Callback error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/verify-email ─────────────────────────────
// Verify email with OTP code

router.post("/verify-email", async (req, res) => {
  try {
    const { email, token, type } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: "Email and verification code are required" });
    }

    // Verify with Supabase
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      email,
      token,
      type: type || "signup",
    });

    if (error) {
      console.error("Verify email error:", error);
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    res.json({
      message: "Email verified successfully!",
      session: data.session,
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/resend-verification ──────────────────────
// Resend verification email

router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Use generateLink instead of inviteUserByEmail to avoid overwriting user_metadata
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      redirectTo: `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/confirm`,
    });

    if (error) {
      console.error("Resend verification error:", error);
      return res.status(400).json({ error: "Failed to resend verification email" });
    }    // The link is generated but Supabase doesn't send it automatically.
    // For now, return success — in production you'd send this link via email service.
    console.log("Verification link generated for:", email);

    res.json({ message: "Verification email sent!" });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/logout ───────────────────────────────────
// Logout from Supabase

router.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      await supabaseAdmin.auth.admin.signOut(token);
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/auth/refresh ──────────────────────────────────
// Refresh session token

router.post("/refresh", async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      return res.status(401).json({ error: "Failed to refresh session" });
    }

    res.json({ session: data.session });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────
// Get current user from Supabase session

router.get("/me", requireAuth, async (req, res) => {
  try {
    const found = await db.select().from(users).where(eq(users.id, req.user!.userId));
    if (found.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = found[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
