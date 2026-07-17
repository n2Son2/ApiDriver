import { NextRequest, NextResponse } from "next/server";
import { uploadImageToDrive, UPLOAD_API_KEY } from "@/lib/google-drive";

export const runtime = "nodejs";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
]);

export async function POST(request: NextRequest) {
  try {
    const providedKey = request.headers.get("x-api-key");
    if (!providedKey || providedKey !== UPLOAD_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: thiếu hoặc sai x-api-key" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Thiếu field 'file' trong multipart/form-data" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: `MIME không hỗ trợ: ${file.type || "(empty)"}. Chỉ nhận ảnh.`,
        },
        { status: 400 }
      );
    }

    const maxBytes = 4.5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { ok: false, error: "File vượt giới hạn ~4.5MB (giới hạn Vercel)" },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImageToDrive({
      buffer,
      fileName: file.name || `upload-${Date.now()}.jpg`,
      mimeType: file.type,
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    console.error("[upload]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
