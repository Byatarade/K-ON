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
 * Status mapper for order steps (clean without emoji)
 */
export const ORDER_STATUS = {
  0: { label: "Menunggu Konfirmasi", color: "warning", text: "Menunggu" },
  1: { label: "Sedang Dimasak", color: "primary", text: "Dimasak" },
  2: { label: "Makanan Siap Diambil / Diantar", color: "info", text: "Siap / Diantar" },
  3: { label: "Pesanan Selesai", color: "success", text: "Selesai" },
  4: { label: "Pesanan Dibatalkan", color: "danger", text: "Dibatalkan" },
};

/**
 * Helper to get contextual status label and text based on delivery option
 */
export function getOrderStatusInfo(status, opsi_antar = false) {
  if (status === 0) {
    return { label: "Menunggu Konfirmasi", color: "warning", text: "Menunggu" };
  }
  if (status === 1) {
    return { label: "Sedang Dimasak", color: "primary", text: "Dimasak" };
  }
  if (status === 2) {
    return opsi_antar
      ? { label: "Makanan Sedang Diantar", color: "info", text: "Sedang Diantar" }
      : { label: "Makanan Siap Diambil", color: "info", text: "Siap Diambil" };
  }
  if (status === 3) {
    return { label: "Pesanan Selesai", color: "success", text: "Selesai" };
  }
  if (status === 4) {
    return { label: "Pesanan Dibatalkan", color: "danger", text: "Dibatalkan" };
  }
  return { label: "Menunggu Konfirmasi", color: "warning", text: "Menunggu" };
}

export const ONGKIR_FLAT = 2000;
