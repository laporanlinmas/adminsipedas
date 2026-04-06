import { google } from "googleapis";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

/**
 * DriveService handles photo uploads to Google Drive using a service account.
 * Requires:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL
 * - GOOGLE_PRIVATE_KEY
 * - FOLDER_ID_FOTO
 */
class DriveService {
  private auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  });

  private drive = google.drive({ version: "v3", auth: this.auth });

  /**
   * Uploads a base64 image data to Google Drive.
   * @param base64Data The image data in base64 format (with or without prefix).
   * @returns Object with id, webViewLink, and success status.
   */
  async uploadFoto(base64Data: string) {
    try {
      if (!base64Data) throw new Error("No photo data provided");

      // Extract raw base64 and mime type
      const mimeMatch = base64Data.match(/^data:(image\/[a-z]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const rawBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");
      const buffer = Buffer.from(rawBase64, "base64");

      const fileName = `PEDAS_IMG_${Date.now()}.jpg`;
      const folderId = process.env.FOLDER_ID_FOTO || "";

      const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
      };

      const media = {
        mimeType: mimeType,
        body: Readable.from(buffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink",
      });

      // Set permission to anyone with link (view only)
      if (response.data.id) {
        await this.drive.permissions.create({
          fileId: response.data.id,
          requestBody: { role: "reader", type: "anyone" },
        });
      }

      return {
        success: true,
        id: response.data.id,
        link: response.data.webViewLink,
      };
    } catch (error: any) {
      console.error("Drive upload error:", error);
      return { success: false, message: error.message };
    }
  }
}

export const driveService = new DriveService();
