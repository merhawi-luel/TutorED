import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase";

const router = Router();

// ─── System Prompt Builder ─────────────────────────────────────

function buildSystemPrompt(role: string | null): string {
  const base = `You are the TutorED assistant. TutorED is an education talent platform connecting tutors, agencies, and parents in Ethiopia. Your job is to help users navigate the app and answer questions about how it works. You do NOT take actions on the user's behalf — you only explain and guide. Keep answers short (2-4 sentences unless more detail is truly needed). If you don't know something specific to this user's account data, say so and point them to the right page instead of guessing.`;

  const roleSections: Record<string, string> = {
    tutor: `

You are speaking with a TUTOR. Their dashboard pages are:
- Overview — see profile stats, rating, and recent activity
- My Profile — edit your headline, bio, subjects, grades, experience, teaching mode, availability, phone, and location
- Docs & Verification — upload documents (government ID, teaching certificate, degree, etc.) and request verification
- Education — add and manage education entries (degrees, certifications, courses)
- Vacancies — browse open tutoring vacancies posted by agencies and parents
- Applications — track your applications and their statuses (applied, under_review, shortlisted, interview, accepted, completed, rejected, withdrawn)
- Reviews — see feedback from parents after completed jobs
- Settings — change password and manage notification preferences`,

    agency: `

You are speaking with an AGENCY. Their dashboard pages are:
- Overview — see organization stats, applicant counts, and recent activity
- Create Vacancy — post a new tutoring vacancy with subjects, grades, salary, location, and requirements
- My Posts — manage your posted vacancies (edit, close, view applicants)
- Applicants — review tutors who applied to your vacancies and change their status (shortlisted, interview, accepted, rejected)
- Recruit Requests — see incoming recruitment requests from parents
- Verify Organization — upload payment receipt to get verified by admin
- Organization — edit your agency name, description, location, and subjects
- Settings — change password and manage notification preferences`,

    parent: `

You are speaking with a PARENT. Their dashboard pages are:
- Overview — see your activity summary and recent requests
- My Profile — edit your contact information
- Find a Recruiter — contact a verified agency to handle tutor recruitment for you (select agency, subjects, grades, location, and notes)
- Vacancies — browse open tutoring vacancies posted by agencies
- Applicants — review tutors recommended by agencies for your requests
- Leave Review — rate and review a tutor after a completed tutoring engagement
- My Requests — track your recruitment requests to agencies
- Settings — change password and manage preferences`,

    admin: `

You are speaking with an ADMIN. Their dashboard pages are:
- Overview — see platform-wide stats (total tutors, agencies, pending verifications)
- Verification Queue — review and approve/reject agency verification requests (payment receipts)
- Documents — review and approve/reject tutor uploaded documents
- Education Review — review and approve/reject tutor education entries
- Tutors — view all registered tutors on the platform
- Agencies — view all registered agencies and their verification status
- Agency Receipts — preview agency payment receipts
- Admins — manage other admin accounts
- Settings — platform settings`,

    null: `

The user is NOT logged in (public/visitor). TutorED is an education platform in Ethiopia where:
- Tutors create profiles, upload credentials, and apply to tutoring jobs
- Agencies post vacancies and recruit tutors on behalf of parents
- Parents request tutors through agencies or browse vacancies directly
To use most features, they need to register at /register as a tutor, agency, or parent. They can browse public vacancies at /vacancies without logging in.`,
  };

  const faq = `

Common questions you may be asked:
- "How does verification work for tutors?" → Tutors upload documents (government ID, teaching certificate, degree certificate) in the Docs & Verification page, then click "Request Verification." An admin reviews and approves or rejects each document. Once all required docs are verified, the tutor's profile shows "Fully Verified."
- "How does an agency post a vacancy?" → Agencies go to "Create Vacancy" in their dashboard, fill in title, subjects, grades, salary, location, teaching mode, and requirements, then save. The vacancy appears in the public listings and tutors can apply.
- "How does a parent request a tutor?" → Parents go to "Find a Recruiter," select a verified agency, choose subjects and grades needed, add their contact info and location, then send the request. The agency reviews it and finds suitable tutors.
- "What do application statuses mean?" → applied (just submitted), under_review (agency is reviewing), shortlisted (you're a candidate), interview (interview scheduled), accepted (you got the job), completed (job finished), rejected (not selected), withdrawn (you cancelled your application).`;

  return base + (roleSections[role || "null"] || roleSections["null"]) + faq;
}

// ─── POST /api/assistant/chat ──────────────────────────────────

router.post("/chat", async (req, res) => {
  try {
    // Check if GROQ_API_KEY is configured
    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY is not set in environment variables");
      return res.status(503).json({ error: "Assistant is not configured" });
    }

    const { messages } = req.body;

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages must be a non-empty array" });
    }

    // Cap to last 20 messages
    const cappedMessages = messages.slice(-20);

    // Resolve user role from optional auth token
    let role: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && user) {
          role = user.user_metadata?.role || null;
        }
      } catch {
        // Token invalid — proceed as anonymous
      }
    }

    // Build messages array for Groq
    const systemPrompt = buildSystemPrompt(role);
    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...cappedMessages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: groqMessages,
        max_tokens: 500,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`❌ Groq API error (${response.status}):`, errorBody);

      if (response.status === 429) {
        return res.status(429).json({ error: "Assistant is busy, please try again in a moment" });
      }

      return res.status(502).json({ error: "Assistant is temporarily unavailable" });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    res.json({ reply });
  } catch (error) {
    console.error("❌ Assistant error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
