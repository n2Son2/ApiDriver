import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ApiDriver — Upload Google Drive",
  description: "API upload ảnh lên Google Drive (Next.js + Vercel)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          background: "#fafafa",
          color: "#18181b",
          lineHeight: 1.5,
        }}
      >
        <header
          style={{
            borderBottom: "1px solid #e4e4e7",
            background: "#fff",
            padding: "0.75rem 1.25rem",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <strong>ApiDriver</strong>
          <a href="/" style={{ color: "#2563eb", textDecoration: "none" }}>
            Upload
          </a>
          <a href="/auth" style={{ color: "#2563eb", textDecoration: "none" }}>
            Auth
          </a>
        </header>
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem 1.25rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
