import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, setRefreshToken } from "@/lib/google-drive";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return new NextResponse(
      htmlPage("OAuth thất bại", `<p>Google trả lỗi: <code>${escapeHtml(error)}</code></p>`),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (!code) {
    return new NextResponse(
      htmlPage("Thiếu code", "<p>Không nhận được authorization code từ Google.</p>"),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      return new NextResponse(
        htmlPage(
          "Không có refresh_token",
          `<p>Google không trả <code>refresh_token</code>. Thử lại với <code>prompt=consent</code> hoặc thu hồi quyền app rồi đăng nhập lại tại <a href="/api/auth/google">/api/auth/google</a>.</p>
           <pre>${escapeHtml(JSON.stringify(tokens, null, 2))}</pre>`
        ),
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    setRefreshToken(refreshToken);

    return new NextResponse(
      htmlPage(
        "Đã lưu refresh token — sẵn sàng upload",
        `<p>Refresh token đã được tự động lưu vào bộ nhớ. Bạn có thể <a href="/">upload ảnh ngay</a>.</p>
         <p style="color:#71717a;font-size:0.9rem">Token sẽ mất khi server khởi động lại (cold start). Để lưu lâu dài, copy giá trị dưới đây vào env <code>GOOGLE_REFRESH_TOKEN</code>:</p>
         <pre id="token">${escapeHtml(refreshToken)}</pre>
         <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('token').textContent)">Copy token</button>
         <p style="margin-top:1.5rem"><a href="/">Về trang upload</a></p>`
      ),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    return new NextResponse(
      htmlPage("Đổi code thất bại", `<p>${escapeHtml(message)}</p>`),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function htmlPage(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    pre { background: #f4f4f5; padding: 1rem; overflow-x: auto; word-break: break-all; white-space: pre-wrap; border-radius: 8px; }
    button { padding: 0.5rem 1rem; cursor: pointer; }
    code { background: #f4f4f5; padding: 0.1rem 0.3rem; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${body}
</body>
</html>`;
}
