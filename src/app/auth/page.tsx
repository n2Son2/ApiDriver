export default function AuthPage() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Lấy Google Refresh Token</h1>
      <p style={{ color: "#52525b" }}>
        Làm một lần (hoặc khi mất token). Token lưu vào env, không cần đăng nhập mỗi lần upload.
      </p>

      <ol style={{ paddingLeft: "1.2rem" }}>
        <li>
          Trong Google Cloud Console: bật <strong>Google Drive API</strong>, tạo OAuth Client
          kiểu <strong>Web application</strong>.
        </li>
        <li>
          Thêm Authorized redirect URI:
          <ul>
            <li>
              <code>http://localhost:3000/api/auth/callback</code>
            </li>
            <li>
              <code>https://&lt;vercel-domain&gt;/api/auth/callback</code>
            </li>
          </ul>
        </li>
        <li>
          Điền <code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code>,{" "}
          <code>GOOGLE_REDIRECT_URI</code> vào <code>.env.local</code>.
        </li>
        <li>
          Bấm nút bên dưới → đăng nhập Google → copy <code>refresh_token</code> vào env{" "}
          <code>GOOGLE_REFRESH_TOKEN</code>.
        </li>
        <li>
          Restart <code>npm run dev</code> / redeploy Vercel, rồi upload tại{" "}
          <a href="/">/</a>.
        </li>
      </ol>

      <a
        href="/api/auth/google"
        style={{
          display: "inline-block",
          marginTop: "0.5rem",
          padding: "0.75rem 1.25rem",
          borderRadius: 8,
          background: "#2563eb",
          color: "#fff",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Đăng nhập Google &amp; lấy refresh token
      </a>

      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          background: "#fffbeb",
          border: "1px solid #fcd34d",
          borderRadius: 12,
        }}
      >
        <strong>Lưu ý:</strong> Nếu không thấy <code>refresh_token</code>, vào{" "}
        <a
          href="https://myaccount.google.com/permissions"
          target="_blank"
          rel="noreferrer"
        >
          Google Account → Third-party access
        </a>{" "}
        thu hồi quyền app, rồi chạy lại bước này (app dùng <code>prompt=consent</code>).
      </div>
    </div>
  );
}
