import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabase";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware: Require valid Supabase JWT token
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the JWT with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Get role from OUR database (database is the source of truth, not user_metadata)
    const [dbUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.id));

    if (!dbUser) {
      return res.status(404).json({ error: "User not found in database" });
    }

    req.user = {
      userId: user.id,
      email: user.email || "",
      role: dbUser.role,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Authentication failed" });
  }
}

/**
 * Middleware: Require specific role(s)
 * Usage: requireRole("admin") or requireRole("tutor", "agency")
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}
