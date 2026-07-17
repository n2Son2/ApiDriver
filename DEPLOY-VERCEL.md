# Hướng dẫn deploy ApiDriver lên Vercel (free)

**Mã nguồn:** `0.README/ApiDriver`

Tài liệu này hướng dẫn deploy API upload ảnh Google Drive (Next.js) lên Vercel, cấu hình env và OAuth production.

---

## Mục đích

- Đưa project lên Vercel miễn phí (Hobby).
- Cấu hình biến môi trường an toàn (không commit secret).
- Hoàn tất OAuth Google để lấy `GOOGLE_REFRESH_TOKEN` trên production.

---

## Điều kiện trước khi deploy

- Tài khoản [GitHub](https://github.com) và [Vercel](https://vercel.com)
- Project đã có code trong `ApiDriver` (đã `npm run build` local thành công)
- Google Cloud:
  - Đã bật **Google Drive API**
  - OAuth Client kiểu **Web application**
  - Có `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`

---

## Bước 1 — Đẩy code lên GitHub

```bash
cd ApiDriver
git status
# Đảm bảo .env, .env.local KHÔNG bị add (đã có trong .gitignore)
git add .
git commit -m "Add ApiDriver Next.js Google Drive upload API"
git remote add origin https://github.com/<user>/<repo>.git   # nếu chưa có
git push -u origin main
```

**Quan trọng:** Không push file chứa secret (`.env`, `.env.local`).

---

## Bước 2 — Import project trên Vercel

1. Đăng nhập [vercel.com](https://vercel.com) → **Add New…** → **Project**.
2. **Import** repository GitHub chứa `ApiDriver`.
3. Nếu repo có nhiều thư mục: set **Root Directory** = `ApiDriver` (hoặc thư mục chứa `package.json`).
4. Framework Preset: **Next.js** (Vercel tự nhận).
5. Build settings mặc định:
   - Build Command: `next build` / `npm run build`
   - Output: Next.js (không cần chỉnh)
6. **Chưa bấm Deploy** nếu chưa thêm env — hoặc Deploy lần 1 rồi thêm env và Redeploy (xem bước 3–4).

Sau khi có URL dạng:

```text
https://<your-app>.vercel.app
```

ghi lại domain này để điền env và Google Console.

---

## Bước 3 — Thêm Environment Variables trên Vercel

Vào **Project → Settings → Environment Variables**.

Thêm từng biến (Environment: chọn **Production**, nên thêm cả **Preview** nếu dùng preview deploy):

| Name | Giá trị mẫu / ghi chú |
|------|------------------------|
| `GOOGLE_CLIENT_ID` | OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | `https://<your-app>.vercel.app/api/auth/callback` |
| `NEXT_PUBLIC_APP_URL` | `https://<your-app>.vercel.app` |
| `UPLOAD_API_KEY` | Chuỗi bí mật mạnh (đổi khỏi `change-me-...`) |
| `GOOGLE_REFRESH_TOKEN` | Để trống lần đầu — điền sau bước 5 |
| `GOOGLE_DRIVE_FOLDER_ID` | (Tùy chọn) ID folder Drive |

Có thể tham chiếu file local [`.env`](.env): thay `YOUR-PROJECT` bằng `<your-app>` rồi copy từng dòng lên Dashboard.

### Cách thêm nhanh bằng Vercel CLI (tùy chọn)

```bash
npm i -g vercel
cd ApiDriver
vercel login
vercel link
vercel env add GOOGLE_CLIENT_ID
# ... lặp cho các biến còn lại
vercel --prod
```

---

## Bước 4 — Cấu hình Google Cloud (redirect production)

1. Mở [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Mở OAuth 2.0 Client (Web application).
3. **Authorized redirect URIs** → Add:
   - `http://localhost:3000/api/auth/callback` (local)
   - `https://<your-app>.vercel.app/api/auth/callback` (production)
4. **Authorized JavaScript origins** (nếu Console yêu cầu):
   - `http://localhost:3000`
   - `https://<your-app>.vercel.app`
5. Save.

Scope app dùng: `https://www.googleapis.com/auth/drive.file`.

---

## Bước 5 — Deploy và lấy Refresh Token

1. Vercel → **Deployments** → **Redeploy** (sau khi lưu env), hoặc push commit mới.
2. Đợi build xanh (Ready).
3. Mở: `https://<your-app>.vercel.app/auth`
4. Bấm **Đăng nhập Google & lấy refresh token** → chọn tài khoản → đồng ý quyền.
5. Copy giá trị `refresh_token` hiện ra.
6. Vercel → **Settings → Environment Variables** → thêm/sửa:

   ```text
   GOOGLE_REFRESH_TOKEN=<dán token vừa copy>
   ```

7. **Redeploy** lại (bắt buộc để production nhận token mới).

Nếu không thấy `refresh_token`:

- Vào [Google Account → Third-party access](https://myaccount.google.com/permissions)
- Thu hồi quyền app
- Chạy lại `/auth` (app dùng `prompt=consent`)

---

## Bước 6 — Kiểm tra upload trên production

### UI

1. Mở `https://<your-app>.vercel.app/`
2. Nhập `UPLOAD_API_KEY`
3. Chọn ảnh → Upload
4. Kỳ vọng JSON có `fileId`, `webViewLink`, `webContentLink`

### curl

```bash
curl -X POST https://<your-app>.vercel.app/api/upload \
  -H "x-api-key: <UPLOAD_API_KEY>" \
  -F "file=@./photo.jpg"
```

Response mẫu:

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

---

## Checklist nhanh

- [ ] Repo GitHub không chứa `.env` / `.env.local`
- [ ] Root Directory trên Vercel đúng thư mục có `package.json`
- [ ] Đã set đủ env (đặc biệt `GOOGLE_REDIRECT_URI` trùng domain Vercel)
- [ ] Google Console đã thêm redirect URI production
- [ ] Đã lấy `GOOGLE_REFRESH_TOKEN` qua `/auth` và Redeploy
- [ ] `UPLOAD_API_KEY` đã đổi thành chuỗi mạnh
- [ ] Test `POST /api/upload` thành công

---

## Lỗi thường gặp

| Triệu chứng | Nguyên nhân / cách xử lý |
|-------------|---------------------------|
| `redirect_uri_mismatch` | Redirect URI trên Google Console ≠ `GOOGLE_REDIRECT_URI` trên Vercel |
| `Thiếu GOOGLE_REFRESH_TOKEN` | Chưa chạy `/auth` hoặc quên Redeploy sau khi thêm env |
| `Unauthorized: thiếu hoặc sai x-api-key` | Header `x-api-key` không khớp `UPLOAD_API_KEY` |
| Upload > ~4.5MB fail | Giới hạn body Vercel serverless — nén/resize ảnh |
| Build fail / module not found | Kiểm tra Root Directory, `package.json`, chạy `npm run build` local |
| OAuth OK nhưng không có refresh_token | Thu hồi quyền app → `/auth` lại |

---

## Bảo mật

- Không commit Client Secret / Refresh Token / API Key.
- Nếu secret đã lộ (chat, screenshot): tạo lại Client Secret trên Google Cloud và cập nhật Vercel env.
- Trang `/auth` chỉ cần khi setup; có thể bỏ qua / hạn chế sau khi đã có refresh token.
- File upload được set quyền **anyone with the link** — cân nhắc nếu ảnh nhạy cảm.

---

## Domain tùy chỉnh (tùy chọn)

1. Vercel → **Settings → Domains** → thêm domain riêng.
2. Cập nhật env:
   - `NEXT_PUBLIC_APP_URL=https://your-domain.com`
   - `GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/callback`
3. Thêm redirect URI mới trên Google Console.
4. Redeploy. Có thể cần chạy lại `/auth` nếu redirect cũ khác.

---

## Tham chiếu

- README tổng quan: [README.md](README.md)
- Mẫu env local/Vercel: [`.env.example`](.env.example)
- Docs Vercel: [https://vercel.com/docs](https://vercel.com/docs)
- Google Drive API: [https://developers.google.com/drive/api](https://developers.google.com/drive/api)
