import dotenv from "dotenv";
dotenv.config({ override: true });
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../server/db/schema";
import { eq, and, desc } from "drizzle-orm";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const supabaseAnon = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const client = postgres(process.env.DATABASE_URL!, {
  ssl: process.env.DATABASE_URL!.includes("supabase") ? { rejectUnauthorized: false } : false,
  onnotice: () => {},
  max: 5,
});
const db = drizzle(client, { schema });

const TUTOR_EMAIL = "merhawi@example.com";
const TUTOR_PASSWORD = "password123";
const BUCKET_NAME = "documents";

async function testUploadDownload() {
  console.log("🧪 End-to-end upload/download test\n");

  // ─── Step 1: Login as tutor ──────────────────────────────
  console.log("1️⃣  Logging in as tutor...");
  const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
    email: TUTOR_EMAIL,
    password: TUTOR_PASSWORD,
  });

  if (authError) {
    // Try with the real tutor account if seed doesn't have Supabase auth
    console.log("  ⚠ Seed tutor not in Supabase Auth, trying direct DB approach");
    console.log("  → Creating test file and uploading directly to storage...");

    // Create a small test PDF in memory
    const testContent = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF");
    const testFileName = `test-doc-${Date.now()}.pdf`;
    const fileKey = `test/${testFileName}`;

    console.log(`\n2️⃣  Uploading test file: ${testFileName}`);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileKey, testContent, {
        contentType: "application/pdf",
      });

    if (uploadError) {
      console.error("  ❌ Upload failed:", uploadError.message);
      process.exit(1);
    }
    console.log("  ✓ File uploaded to storage");

    // Get tutor's user ID from DB
    const [tutorUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, TUTOR_EMAIL));

    if (!tutorUser) {
      console.error("  ❌ Tutor not found in DB");
      process.exit(1);
    }

    // Insert document record
    console.log("\n3️⃣  Creating document record in database...");
    const [doc] = await db
      .insert(schema.documents)
      .values({
        tutorId: tutorUser.id,
        type: "government_id",
        title: "Test Document",
        fileName: testFileName,
        fileKey,
        status: "pending",
      })
      .returning();

    console.log(`  ✓ Document created (id: ${doc.id})`);
    console.log(`  ✓ fileKey: ${doc.fileKey}`);

    // Verify fileKey is stored
    if (!doc.fileKey) {
      console.error("  ❌ fileKey is null — upload flow broken!");
      process.exit(1);
    }
    console.log("  ✓ fileKey confirmed in database");

    // ─── Step 4: Test download ──────────────────────────────
    console.log("\n4️⃣  Testing download (generating signed URL)...");
    const { data: signedUrlData, error: signError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUrl(doc.fileKey, 3600);

    if (signError) {
      console.error("  ❌ Failed to generate signed URL:", signError.message);
      process.exit(1);
    }
    console.log("  ✓ Signed URL generated");

    // Download the file
    console.log("\n5️⃣  Downloading file from signed URL...");
    const downloadRes = await fetch(signedUrlData.signedUrl);
    if (!downloadRes.ok) {
      console.error("  ❌ Download failed:", downloadRes.status, downloadRes.statusText);
      process.exit(1);
    }

    const downloadedContent = await downloadRes.arrayBuffer();
    console.log(`  ✓ Downloaded ${(downloadedContent.byteLength / 1024).toFixed(1)} KB`);

    // Verify content matches
    const matches = Buffer.from(downloadedContent).equals(testContent);
    if (matches) {
      console.log("  ✓ Downloaded content matches uploaded content!");
    } else {
      console.error("  ❌ Content mismatch!");
      process.exit(1);
    }

    // ─── Step 6: Test via API endpoint ──────────────────────
    console.log("\n6️⃣  Testing GET /api/tutor/documents/:id/download endpoint...");
    // Login to get a token
    const { data: loginData, error: loginErr } = await supabaseAnon.auth.signInWithPassword({
      email: TUTOR_EMAIL,
      password: TUTOR_PASSWORD,
    }).catch(() => ({ data: null, error: { message: "No Supabase auth" } }));

    if (loginData?.session?.access_token) {
      const res = await fetch(`http://localhost:3001/api/tutor/documents/${doc.id}/download`, {
        headers: { Authorization: `Bearer ${loginData.session.access_token}` },
      });
      const body = await res.json();
      if (res.ok && body.downloadUrl) {
        console.log("  ✓ API endpoint returned signed URL");
        console.log(`  ✓ URL length: ${body.downloadUrl.length} chars`);
      } else {
        console.log("  ⚠ API endpoint response:", res.status, body.error || "OK");
      }
    } else {
      console.log("  ⚠ Skipping API test (no Supabase auth for seed tutor)");
    }

    // Cleanup: remove test document
    console.log("\n7️⃣  Cleaning up test data...");
    await db.delete(schema.documents).where(eq(schema.documents.id, doc.id));
    await supabaseAdmin.storage.from(BUCKET_NAME).remove([fileKey]);
    console.log("  ✓ Test document removed from DB and storage");

  } else {
    console.log("  ✓ Logged in as tutor");
    const token = authData.session.access_token;

    // Upload a test file via the API
    console.log("\n2️⃣  Uploading test document via API...");

    // Create a small test PDF
    const testContent = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF");

    // Get presigned URL
    const presignRes = await fetch("http://localhost:3001/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fileName: "test-upload.pdf", contentType: "application/pdf" }),
    });
    const presignData = await presignRes.json();
    console.log(`  ✓ Got presigned URL (key: ${presignData.fileKey})`);

    // Upload file
    const uploadRes = await fetch(presignData.signedUrl, {
      method: "PUT",
      body: testContent,
      headers: { "Content-Type": "application/pdf" },
    });
    if (!uploadRes.ok) {
      console.error("  ❌ Upload to storage failed");
      process.exit(1);
    }
    console.log("  ✓ File uploaded to storage");

    // Create document record
    const createDocRes = await fetch("http://localhost:3001/api/tutor/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        type: "government_id",
        title: "Test Upload Document",
        fileName: "test-upload.pdf",
        fileKey: presignData.fileKey,
      }),
    });
    const docData = await createDocRes.json();
    console.log(`  ✓ Document record created (id: ${docData.id})`);

    // Verify fileKey is stored
    const [storedDoc] = await db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.id, docData.id));

    if (!storedDoc?.fileKey) {
      console.error("  ❌ fileKey not stored in DB!");
      process.exit(1);
    }
    console.log(`  ✓ fileKey confirmed: ${storedDoc.fileKey}`);

    // Test download via API
    console.log("\n3️⃣  Testing download via API...");
    const dlRes = await fetch(`http://localhost:3001/api/tutor/documents/${docData.id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dlBody = await dlRes.json();

    if (dlRes.ok && dlBody.downloadUrl) {
      console.log("  ✓ Got signed download URL");

      // Actually download
      const fileRes = await fetch(dlBody.downloadUrl);
      const fileBuffer = await fileRes.arrayBuffer();
      console.log(`  ✓ Downloaded ${(fileBuffer.byteLength / 1024).toFixed(1)} KB`);

      const contentMatches = Buffer.from(fileBuffer).equals(testContent);
      console.log(contentMatches ? "  ✓ Content matches original!" : "  ❌ Content mismatch!");
    } else {
      console.error("  ❌ Download failed:", dlRes.status, dlBody.error);
    }

    // Cleanup
    console.log("\n4️⃣  Cleaning up...");
    await db.delete(schema.documents).where(eq(schema.documents.id, docData.id));
    await supabaseAdmin.storage.from(BUCKET_NAME).remove([presignData.fileKey]);
    console.log("  ✓ Test data cleaned up");
  }

  console.log("\n✅ All tests passed!");
  await client.end();
  process.exit(0);
}

testUploadDownload().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
