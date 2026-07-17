"use client";

import { FormEvent, useState } from "react";

type UploadResponse = {
  ok: boolean;
  error?: string;
  fileId?: string;
  name?: string;
  mimeType?: string;
  webViewLink?: string | null;
  webContentLink?: string | null;
};

const API_KEY = "sonanh1102";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setResult({ ok: false, error: "Chọn file ảnh trước" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-api-key": API_KEY,
        },
        body: formData,
      });

      const data = (await res.json()) as UploadResponse;
      setResult(data);
    } catch (err) {
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : "Lỗi mạng",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Upload ảnh lên Google Drive</h1>
      <p style={{ color: "#52525b" }}>
        Chưa có refresh token? <a href="/auth">Đăng nhập Google tại /auth</a> trước.
      </p>

      <form
        onSubmit={onSubmit}
        style={{
          display: "grid",
          gap: "1rem",
          background: "#fff",
          border: "1px solid #e4e4e7",
          borderRadius: 12,
          padding: "1.25rem",
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span>File ảnh</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.65rem 1rem",
            borderRadius: 8,
            border: "none",
            background: loading ? "#93c5fd" : "#2563eb",
            color: "#fff",
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Đang upload…" : "Upload"}
        </button>
      </form>

      {result && (
        <div
          style={{
            marginTop: "1.25rem",
            padding: "1rem",
            borderRadius: 12,
            border: `1px solid ${result.ok ? "#86efac" : "#fecaca"}`,
            background: result.ok ? "#f0fdf4" : "#fef2f2",
          }}
        >
          {result.ok ? (
            <>
              <p style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>Thành công</p>
              <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                <li>
                  <strong>fileId:</strong> {result.fileId}
                </li>
                <li>
                  <strong>name:</strong> {result.name}
                </li>
                <li>
                  <strong>mimeType:</strong> {result.mimeType}
                </li>
                {result.webViewLink && (
                  <li>
                    <strong>webViewLink:</strong>{" "}
                    <a href={result.webViewLink} target="_blank" rel="noreferrer">
                      {result.webViewLink}
                    </a>
                  </li>
                )}
                {result.webContentLink && (
                  <li>
                    <strong>webContentLink:</strong>{" "}
                    <a href={result.webContentLink} target="_blank" rel="noreferrer">
                      {result.webContentLink}
                    </a>
                  </li>
                )}
              </ul>
            </>
          ) : (
            <p style={{ margin: 0 }}>
              <strong>Lỗi:</strong> {result.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

