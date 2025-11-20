import { ipcMain, protocol } from "electron";
import fs from "node:fs";
import path from "node:path";
import {
  secretLogger,
  logSystemInfo,
  logSystemError,
} from "../../src/utils/SecretLogger";

/**
 * Image Manager Module
 * Handles loading images from directories and serving them via custom protocol
 */

async function loadImagesFromDirectory(dirPath: string) {
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];

  try {
    const files = await new Promise<string[]>((resolve, reject) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });

    const imageFiles = files
      .filter((file) =>
        allowedExtensions.includes(path.extname(file).toLowerCase())
      )
      .slice(0, 12); // Increase limit to 12 images for better selection

    // Return custom protocol URLs instead of file:// URLs for security
    const imagePaths = imageFiles.map((file) => {
      const fullPath = path.join(dirPath, file);
      // Use our custom protocol to serve local images
      const customUrl = `local-image://${encodeURIComponent(fullPath)}`;
      return customUrl;
    });

    console.log(
      "📁 loadImagesFromDirectory: Returning custom protocol URLs:",
      imagePaths.slice(0, 3),
      "..."
    );

    // Log detailed image loading info
    logSystemInfo("Background images loaded from directory", {
      directory: dirPath,
      totalFiles: files.length,
      imageFiles: imageFiles.length,
      allowedExtensions,
      sampleImages: imagePaths
        .slice(0, 3)
        .map((url) => decodeURIComponent(url.replace("local-image://", ""))),
    });

    return imagePaths;
  } catch (error) {
    console.error("Error loading images:", error);
    logSystemError("Failed to load background images", {
      directory: dirPath,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

/**
 * Register custom protocol for serving local images
 */
export function registerImageProtocol() {
  protocol.registerFileProtocol("local-image", (request, callback) => {
    try {
      // Extract the file path from the URL
      const url = request.url.substring("local-image://".length);
      const filePath = decodeURIComponent(url);

      console.log("🖼️ Custom protocol serving image:", filePath);

      // Security check - ensure the file exists and is an image
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const allowedExtensions = [
          ".png",
          ".jpg",
          ".jpeg",
          ".gif",
          ".bmp",
          ".webp",
        ];

        if (allowedExtensions.includes(ext)) {
          callback({ path: filePath });
        } else {
          console.error("❌ Rejected non-image file:", filePath);
          callback({ error: -3 }); // Generic error
        }
      } else {
        console.error("❌ Image file not found:", filePath);
        callback({ error: -6 }); // File not found
      }
    } catch (error) {
      console.error("❌ Error serving image via custom protocol:", error);
      callback({ error: -2 }); // Failed
    }
  });

  console.log("✅ Custom protocol 'local-image://' registered successfully");
}

/**
 * Setup all image-related IPC handlers
 */
export function setupImageHandlers() {
  ipcMain.handle("get-images", async (event, dirPath) => {
    return loadImagesFromDirectory(dirPath);
  });

  console.log("✅ Image handlers registered");
}
