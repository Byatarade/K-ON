/**
 * Firebase Storage Upload Helper with Canvas Compression
 */

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, isFirebaseConfigured } from "./firebase";

/**
 * Compress an image file using HTML5 Canvas
 * @param {File} file 
 * @param {number} maxDimension 
 * @param {number} quality 
 * @returns {Promise<Blob>}
 */
export function compressImage(file, maxDimension = 640, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas compression failed"));
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image file to Firebase Storage (or return Base64 if not configured)
 * @param {File} file 
 * @param {string} path - e.g. "menu/item-123.jpg"
 * @returns {Promise<string>} Download URL
 */
export async function uploadImage(file, path) {
  const compressedBlob = await compressImage(file, 640, 0.8);

  if (isFirebaseConfigured() && storage) {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, compressedBlob);
    return await getDownloadURL(storageRef);
  }

  // Fallback to local Base64 string for immediate preview
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(compressedBlob);
  });
}
