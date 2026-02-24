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
      // Extract and decode the file path from the URL
      const url = request.url.substring("local-image://".length);
      const decoded = decodeURIComponent(url);

      // Normalize to resolve any '..' segments before validating
      const filePath = path.normalize(decoded);

      // Guard against path traversal: reject paths containing traversal sequences
      // after normalization (e.g. ../../etc/passwd resolves outside any safe dir)
      if (filePath.includes("..")) {
        console.error("❌ Rejected path traversal attempt:", filePath);
        callback({ error: -3 });
        return;
      }

      const allowedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];
      const ext = path.extname(filePath).toLowerCase();

      if (!allowedExtensions.includes(ext)) {
        console.error("❌ Rejected non-image file:", filePath);
        callback({ error: -3 });
        return;
      }

      if (!fs.existsSync(filePath)) {
        console.error("❌ Image file not found:", filePath);
        callback({ error: -6 });
        return;
      }

      callback({ path: filePath });
    } catch (error) {
      console.error("❌ Error serving image via custom protocol:", error);
      callback({ error: -2 });
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
