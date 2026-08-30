import dotenv from "dotenv";
dotenv.config({ override: true });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkStorage() {
  console.log("🔍 Checking Supabase storage...\n");

  // List existing buckets
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error("❌ Failed to list buckets:", listError.message);
    process.exit(1);
  }

  console.log("Existing buckets:", buckets.map((b) => b.name).join(", ") || "(none)");

  const docsBucket = buckets.find((b) => b.name === "documents");

  if (docsBucket) {
    console.log("✓ 'documents' bucket already exists");
    console.log("  Public:", docsBucket.public);
    console.log("  File size limit:", docsBucket.file_size_limit);
  } else {
    console.log("\n⚠ 'documents' bucket not found. Creating it...");

    const { error: createError } = await supabase.storage.createBucket("documents", {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
    });

    if (createError) {
      console.error("❌ Failed to create bucket:", createError.message);
      process.exit(1);
    }

    console.log("✓ 'documents' bucket created successfully");
  }

  // Test presigned URL generation
  console.log("\n🔍 Testing presigned URL generation...");
  const testKey = "test/test-upload.txt";
  const { data: signedData, error: signError } = await supabase.storage
    .from("documents")
    .createSignedUploadUrl(testKey);

  if (signError) {
    console.error("❌ Failed to generate signed URL:", signError.message);
  } else {
    console.log("✓ Signed URL generated successfully");
    console.log("  URL length:", signedData.signedUrl.length, "chars");
  }

  // Test signed download URL generation
  console.log("\n🔍 Testing signed download URL generation...");
  const { data: downloadData, error: downloadError } = await supabase.storage
    .from("documents")
    .createSignedUrl(testKey, 3600);

  if (downloadError) {
    console.log("⚠ Download URL test (expected - file doesn't exist):", downloadError.message);
  } else {
    console.log("✓ Download URL generated successfully");
  }

  console.log("\n✅ Storage check complete!");
}

checkStorage().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
