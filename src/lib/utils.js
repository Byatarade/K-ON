/**
 * Utility functions for K-ON Kantin Online
 */

/**
 * Format number to Indonesian Rupiah (e.g. 8000 -> "Rp 8.000")
 */
export function formatRupiah(number) {
  if (typeof number !== "number" || isNaN(number)) return "Rp 0";
  const isNegative = number < 0;
  const absValue = Math.abs(Math.round(number));
  return `${isNegative ? "-" : ""}Rp ${absValue.toLocaleString("id-ID")}`;
}

/**
 * Format timestamp to relative or localized time string (HH:MM)
 */
export function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Format timestamp to localized date string (e.g. "Sen, 20 Okt 2026")
 */
export function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

/**
 * Status mapper for order steps
 */
export const ORDER_STATUS = {
  0: { label: "Menunggu konfirmasi 🕐", color: "warning", text: "Menunggu" },
  1: { label: "Sedang dimasak 👩‍🍳", color: "primary", text: "Dimasak" },
  2: { label: "Siap diambil / diantar 🛵", color: "info", text: "Siap / Diantar" },
  3: { label: "Selesai ✅", color: "success", text: "Selesai" },
  4: { label: "Dibatalkan ❌", color: "danger", text: "Batal" },
};

export const ONGKIR_FLAT = 2000;
