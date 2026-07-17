import { google } from "googleapis";
import { Readable } from "stream";

export const UPLOAD_API_KEY = "sonanh1102";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

let cachedRefreshToken: string | null = null;

export function setRefreshToken(token: string) {
  cachedRefreshToken = token;
}

export function getRefreshToken(): string | null {
  return cachedRefreshToken || process.env.GOOGLE_REFRESH_TOKEN?.trim() || null;
}

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Thiếu GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET hoặc GOOGLE_REDIRECT_URI trong env"
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

function getAuthenticatedClient() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error(
      "Thiếu GOOGLE_REFRESH_TOKEN. Mở /auth → đăng nhập Google để tự động lấy token."
    );
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

export type UploadResult = {
  fileId: string;
  name: string;
  mimeType: string;
  webViewLink: string | null;
  webContentLink: string | null;
};

export async function uploadImageToDrive(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<UploadResult> {
  const { buffer, fileName, mimeType } = params;
  const auth = getAuthenticatedClient();
  const drive = google.drive({ version: "v3", auth });

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  const parents = folderId ? [folderId] : undefined;

  const created = await drive.files.create({
    requestBody: {
      name: fileName,
      parents,
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id, name, mimeType, webViewLink, webContentLink",
  });

  const fileId = created.data.id;
  if (!fileId) {
    throw new Error("Google Drive không trả về file id");
  }

  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  const meta = await drive.files.get({
    fileId,
    fields: "id, name, mimeType, webViewLink, webContentLink",
  });

  return {
    fileId,
    name: meta.data.name || fileName,
    mimeType: meta.data.mimeType || mimeType,
    webViewLink: meta.data.webViewLink || null,
    webContentLink: meta.data.webContentLink || null,
  };
}
