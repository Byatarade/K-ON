/**
 * K-ON Notification Helper
 * Handles Web Audio chime, Web Notifications API, and In-App Notification Store.
 */

// Web Audio synthesizer for instant, reliable notification sounds without external audio files
export function playNotificationSound(type = "ready") {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === "ready") {
      // Pleasant multi-tone chime (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.36);
      });
    } else {
      // Alert chime for rejection (G4 -> Eb4)
      const notes = [392.0, 311.13];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);
        gain.gain.setValueAtTime(0, now + idx * 0.14);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.14 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.42);
      });
    }
  } catch (err) {
    console.warn("Audio chime prevented or unsupported:", err);
  }
}

// Device vibration support
export function triggerVibration(pattern = [150, 80, 150]) {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration error
    }
  }
}

// Request Browser Web Notification permission
export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  if (Notification.permission === "default") {
    try {
      return await Notification.requestPermission();
    } catch (e) {
      return "denied";
    }
  }
  return Notification.permission;
}

// Send browser notification
export function sendBrowserNotification(title, options = {}) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }
  if (Notification.permission === "granted") {
    try {
      return new Notification(title, {
        icon: "/icon.svg",
        badge: "/icon.svg",
        ...options,
      });
    } catch (err) {
      console.warn("Could not dispatch browser notification:", err);
    }
  }
  return null;
}

/* ==========================================================================
   In-App Notification Storage Management
   ========================================================================== */

const NOTIF_STORAGE_KEY = "kon_user_notifications";

export function getStoredNotifications(userId = "guest") {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${NOTIF_STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveNotification(userId = "guest", notifItem) {
  if (typeof window === "undefined") return [];
  try {
    const existing = getStoredNotifications(userId);
    // Avoid exact duplicate for same order & status
    const isDuplicate = existing.some(
      (n) => n.orderId === notifItem.orderId && n.status === notifItem.status
    );
    if (isDuplicate) return existing;

    const newItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      read: false,
      ...notifItem,
    };

    const updated = [newItem, ...existing].slice(0, 50); // keep last 50
    localStorage.setItem(`${NOTIF_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
    window.dispatchEvent(new Event("kon_notifications_updated"));
    return updated;
  } catch (e) {
    console.error("Failed to save notification:", e);
    return [];
  }
}

export function markAllNotificationsRead(userId = "guest") {
  if (typeof window === "undefined") return [];
  try {
    const existing = getStoredNotifications(userId);
    const updated = existing.map((n) => ({ ...n, read: true }));
    localStorage.setItem(`${NOTIF_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
    window.dispatchEvent(new Event("kon_notifications_updated"));
    return updated;
  } catch (e) {
    return [];
  }
}

export function clearAllNotifications(userId = "guest") {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${NOTIF_STORAGE_KEY}_${userId}`);
    window.dispatchEvent(new Event("kon_notifications_updated"));
  } catch (e) {
    console.error("Failed to clear notifications:", e);
  }
}
