# ApiDriver — Upload ảnh lên Google Drive

Next.js (App Router) API upload ảnh lên Google Drive bằng OAuth tài khoản cá nhân. Deploy free trên Vercel.

## Yêu cầu

- Node.js 18+
- Google Cloud project với **Google Drive API** đã bật
- OAuth Client kiểu **Web application**

## Cài đặt local

```bash
cd ApiDriver
npm install
cp .env.example .env.local
# điền GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, UPLOAD_API_KEY
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Biến môi trường

| Biến | Mô tả |
|------|--------|
| `GOOGLE_CLIENT_ID` | OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | VD: `http://localhost:3000/api/auth/callback` |
| `GOOGLE_REFRESH_TOKEN` | Lấy một lần qua `/auth` |
| `GOOGLE_DRIVE_FOLDER_ID` | (Tùy chọn) ID folder Drive đích |
| `UPLOAD_API_KEY` | Key bảo vệ `POST /api/upload` |
| `NEXT_PUBLIC_APP_URL` | URL app (local hoặc Vercel) |

## Google Cloud Console

1. Enable **Google Drive API**.
2. Credentials → Create OAuth client ID → **Web application**.
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback`
   - `https://<your-vercel-app>.vercel.app/api/auth/callback`
4. Copy Client ID / Secret vào `.env.local`.

Scope dùng: `https://www.googleapis.com/auth/drive.file`.

## Lấy refresh token (một lần)

1. Chạy `npm run dev`.
2. Mở [http://localhost:3000/auth](http://localhost:3000/auth).
3. Bấm **Đăng nhập Google** → đồng ý quyền.
4. Copy `refresh_token` vào `GOOGLE_REFRESH_TOKEN` trong `.env.local`.
5. Restart server.

## API Upload

**`POST /api/upload`**

- Header: `x-api-key: <UPLOAD_API_KEY>`
- Body: `multipart/form-data`, field `file` (image/*)
- Giới hạn ~4.5MB (Vercel)

### Ví dụ curl

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "x-api-key: change-me-to-a-strong-secret" \
  -F "file=@./photo.jpg"
```

### Response thành công

```json
{
  "ok": true,
  "fileId": "...",
  "name": "photo.jpg",
  "mimeType": "image/jpeg",
  "webViewLink": "https://drive.google.com/...",
  "webContentLink": "https://drive.google.com/..."
}
```

File được set quyền **anyone with the link** (reader).

## Deploy Vercel (free)

Hướng dẫn chi tiết (từng bước, checklist, lỗi thường gặp): **[DEPLOY-VERCEL.md](DEPLOY-VERCEL.md)**.

Tóm tắt:

1. Push repo lên GitHub (không push `.env` / `.env.local`).
2. Import project trên [vercel.com](https://vercel.com).
3. Thêm Environment Variables (xem [`.env`](.env) — đổi `YOUR-PROJECT` thành domain thật).
4. Thêm redirect URI production trên Google Cloud Console.
5. Deploy → `/auth` lấy `GOOGLE_REFRESH_TOKEN` → Redeploy.

## Bảo mật

- Không commit `.env.local`.
- Đổi `UPLOAD_API_KEY` thành chuỗi ngẫu nhiên mạnh.
- Nếu Client Secret đã lộ (chat/log), tạo lại secret trên Google Cloud.
- Trang `/auth` và callback chỉ dùng khi setup — production nên hạn chế truy cập nếu cần.

## Cấu trúc

```
src/
  app/
    page.tsx                 # UI test upload
    auth/page.tsx            # Hướng dẫn lấy token
    api/auth/google/         # Redirect OAuth
    api/auth/callback/       # Nhận code → refresh_token
    api/upload/              # POST upload ảnh
  lib/google-drive.ts        # OAuth + Drive upload
```
