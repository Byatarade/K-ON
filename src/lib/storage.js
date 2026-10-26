/**
 * Image → Base64 Data URL Helper
 *
 * Converts an image file to a base64 data URL string (stored directly in Firestore).
 * Enforces a maximum size of 500 KB for the resulting base64 string.
 * Uses HTML5 Canvas to resize & compress the image.
 */

const MAX_BASE64_BYTES = 500 * 1024; // 500 KB

/**
 * Compress an image file using HTML5 Canvas.
 * Returns a base64 data URL string.
 *
 * @param {File} file         – The image file to process
 * @param {number} maxDim     – Maximum width/height in pixels (default 800)
 * @param {number} quality    – JPEG quality 0‒1 (default 0.8)
 * @returns {Promise<string>} – base64 data URL
 */
function compressToBase64(file, maxDim = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Gagal memuat gambar"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Get the byte size of a base64 data URL string.
 * The actual byte count ≈ 3/4 of the base64‐encoded portion.
 */
function getBase64ByteSize(dataUrl) {
  // dataUrl = "data:image/jpeg;base64,XXXXX..."
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

/**
 * Convert an image File to a base64 data URL that fits under 500 KB.
 *
 * Strategy:
 * 1. Start with maxDim=800, quality=0.8
 * 2. If result > 500 KB, progressively reduce quality (down to 0.3)
 * 3. If still > 500 KB, reduce maxDim (640 → 480 → 320) + quality sweep
 * 4. If nothing works, reject with a helpful error message
 *
 * @param {File} file
 * @returns {Promise<string>} base64 data URL
 */
export async function convertImageToBase64(file) {
  // Quick client-side check on the raw file size –
  // if it's a very small file we can try right away
  const MAX_RAW_SIZE = 10 * 1024 * 1024; // refuse files > 10 MB to keep things sane
  if (file.size > MAX_RAW_SIZE) {
    throw new Error("Ukuran file terlalu besar (maks 10 MB). Silakan pilih gambar yang lebih kecil.");
  }

  const dimensions = [800, 640, 480, 320];
  const qualities = [0.8, 0.65, 0.5, 0.35, 0.25];

  for (const dim of dimensions) {
    for (const q of qualities) {
      const dataUrl = await compressToBase64(file, dim, q);
      const byteSize = getBase64ByteSize(dataUrl);

      if (byteSize <= MAX_BASE64_BYTES) {
        return dataUrl;
      }
    }
  }

  throw new Error(
    "Gagal mengompres gambar di bawah 500 KB. Silakan pilih gambar dengan resolusi lebih kecil atau gunakan format JPG."
  );
}

/**
 * Legacy-compatible wrapper.
 * Returns a base64 data URL (no Firebase Storage upload).
 *
 * @param {File} file
 * @param {string} _path – ignored (kept for backward compatibility)
 * @returns {Promise<string>}
 */
export async function uploadImage(file, _path) {
  return convertImageToBase64(file);
}
