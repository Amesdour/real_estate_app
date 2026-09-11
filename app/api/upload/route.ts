import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireRole, AuthError } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * Saves an uploaded image to local disk under public/uploads and returns its
 * public URL. This works out of the box for local dev and for any
 * traditionally-hosted deployment (a VPS, Railway, Render, a long-running
 * Docker container). It does NOT work on serverless hosts with an ephemeral
 * filesystem (Vercel, most "serverless" platforms) — files written here
 * disappear on the next cold start/deploy there. For those, swap this route
 * to upload to S3/Cloudflare R2 instead and return that URL; nothing else in
 * the app needs to change since callers just get back a URL string either way.
 */
export async function POST(req: NextRequest) {
  try {
    await requireRole("AGENT", "PROPERTY_OWNER", "SUPER_ADMIN");

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WEBP, or GIF images are allowed" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const ext = file.type.split("/")[1];
    const filename = `${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
