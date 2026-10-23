/**
 * Firestore Data Access Layer with Real-Time Listeners & Local Fallback
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { DEFAULT_KANTIN, DEFAULT_MENU } from "./seed";

/* LocalStorage fallback helpers */
const getLocal = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(`kon_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setLocal = (key, val) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`kon_${key}`, JSON.stringify(val));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.error("Storage error:", e);
  }
};

/* ==========================================================================
   Seed Initial Data
   ========================================================================== */

export async function seedFirestore() {
  if (!isFirebaseConfigured() || !db) return;

  try {
    const kantinSnap = await getDocs(collection(db, "kantin"));
    if (kantinSnap.empty) {
      console.log("Seeding initial kantin data to Firestore...");
      for (const k of DEFAULT_KANTIN) {
        await setDoc(doc(db, "kantin", k.id), {
          ...k,
          created_at: serverTimestamp(),
        });
      }
    }

    const menuSnap = await getDocs(collection(db, "menu"));
    if (menuSnap.empty) {
      console.log("Seeding initial menu data to Firestore...");
      for (const m of DEFAULT_MENU) {
        await setDoc(doc(db, "menu", m.id), {
          ...m,
          created_at: serverTimestamp(),
        });
      }
    }
  } catch (err) {
    console.error("Failed to seed Firestore:", err);
  }
}

/* ==========================================================================
   Kantin CRUD & Subscriptions
   ========================================================================== */

export function subscribeKantin(callback) {
  if (isFirebaseConfigured() && db) {
    const q = collection(db, "kantin");
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (list.length === 0) {
          seedFirestore().then(() => callback(DEFAULT_KANTIN));
        } else {
          callback(list);
        }
      },
      (error) => {
        console.error("subscribeKantin error:", error);
        callback(getLocal("kantin", DEFAULT_KANTIN));
      }
    );
  }

  // Local storage fallback
  const list = getLocal("kantin", DEFAULT_KANTIN);
  callback(list);

  const handler = () => callback(getLocal("kantin", DEFAULT_KANTIN));
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }
  return () => {};
}

export async function updateKantinStatus(kantinId, isOpen) {
  if (isFirebaseConfigured() && db) {
    const ref = doc(db, "kantin", String(kantinId));
    await updateDoc(ref, { buka: isOpen });
    return;
  }
  const list = getLocal("kantin", DEFAULT_KANTIN);
  const updated = list.map((k) => (String(k.id) === String(kantinId) ? { ...k, buka: isOpen } : k));
  setLocal("kantin", updated);
}

/**
 * Register a new canteen (seller) account. Returns the new kantin id.
 * Throws Error("USERNAME_TAKEN") if the username already exists.
 */
export async function registerKantin({ nama, emoji, username, password }) {
  const uname = username.trim().toLowerCase();
  const base = {
    nama: nama.trim(),
    emoji: emoji || "🏪",
    warna: "#2563EB",
    username: uname,
    password,
    buka: true,
    foto_url: null,
    qr_url: null,
  };

  if (isFirebaseConfigured() && db) {
    const snap = await getDocs(query(collection(db, "kantin"), where("username", "==", uname)));
    if (!snap.empty) throw new Error("USERNAME_TAKEN");
    const ref = await addDoc(collection(db, "kantin"), { ...base, created_at: serverTimestamp() });
    return ref.id;
  }

  const list = getLocal("kantin", DEFAULT_KANTIN);
  if (list.some((k) => k.username?.toLowerCase() === uname)) throw new Error("USERNAME_TAKEN");
  const id = `k-${Date.now()}`;
  setLocal("kantin", [...list, { ...base, id }]);
  return id;
}

export async function updateKantinProfile(kantinId, data) {
  if (isFirebaseConfigured() && db) {
    const ref = doc(db, "kantin", String(kantinId));
    await updateDoc(ref, data);
    return;
  }
  const list = getLocal("kantin", DEFAULT_KANTIN);
  const updated = list.map((k) => (String(k.id) === String(kantinId) ? { ...k, ...data } : k));
  setLocal("kantin", updated);
}

/* ==========================================================================
   Menu CRUD & Subscriptions
   ========================================================================== */

export function subscribeMenu(kantinId, callback) {
  if (isFirebaseConfigured() && db) {
    const q = kantinId
      ? query(collection(db, "menu"), where("kantin_id", "==", String(kantinId)))
      : collection(db, "menu");

    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(list);
      },
      (error) => {
        console.error("subscribeMenu error:", error);
        const all = getLocal("menu", DEFAULT_MENU);
        callback(kantinId ? all.filter((m) => String(m.kantin_id) === String(kantinId)) : all);
      }
    );
  }

  const all = getLocal("menu", DEFAULT_MENU);
  const filtered = kantinId ? all.filter((m) => String(m.kantin_id) === String(kantinId)) : all;
  callback(filtered);

  const handler = () => {
    const cur = getLocal("menu", DEFAULT_MENU);
    callback(kantinId ? cur.filter((m) => String(m.kantin_id) === String(kantinId)) : cur);
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }
  return () => {};
}

export async function addMenuItem(item) {
  if (isFirebaseConfigured() && db) {
    const docRef = await addDoc(collection(db, "menu"), {
      ...item,
      kantin_id: String(item.kantin_id),
      tersedia: true,
      created_at: serverTimestamp(),
    });
    return docRef.id;
  }
  const all = getLocal("menu", DEFAULT_MENU);
  const newItem = { ...item, id: `m-${Date.now()}`, tersedia: true };
  setLocal("menu", [...all, newItem]);
  return newItem.id;
}

export async function updateMenuItem(id, updates) {
  if (isFirebaseConfigured() && db) {
    const ref = doc(db, "menu", String(id));
    await updateDoc(ref, updates);
    return;
  }
  const all = getLocal("menu", DEFAULT_MENU);
  const updated = all.map((m) => (String(m.id) === String(id) ? { ...m, ...updates } : m));
  setLocal("menu", updated);
}

export async function deleteMenuItem(id) {
  if (isFirebaseConfigured() && db) {
    await deleteDoc(doc(db, "menu", String(id)));
    return;
  }
  const all = getLocal("menu", DEFAULT_MENU);
  setLocal("menu", all.filter((m) => String(m.id) !== String(id)));
}

/* ==========================================================================
   Orders CRUD & Real-Time Subscriptions
   ========================================================================== */

export function subscribeOrdersByKantin(kantinId, callback) {
  if (isFirebaseConfigured() && db) {
    const q = query(
      collection(db, "pesanan"),
      where("kantin_id", "==", String(kantinId)),
      orderBy("created_at", "desc")
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          created_at: d.data().created_at?.toDate?.() || new Date(d.data().created_at || Date.now()),
        }));
        callback(list);
      },
      (error) => {
        console.error("subscribeOrdersByKantin error:", error);
        const all = getLocal("orders", []);
        callback(all.filter((o) => String(o.kantin_id) === String(kantinId)));
      }
    );
  }

  const all = getLocal("orders", []);
  callback(all.filter((o) => String(o.kantin_id) === String(kantinId)));

  const handler = () => {
    const cur = getLocal("orders", []);
    callback(cur.filter((o) => String(o.kantin_id) === String(kantinId)));
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }
  return () => {};
}

export function subscribeCustomerOrders(orderIds, callback) {
  if (!orderIds || orderIds.length === 0) {
    callback([]);
    return () => {};
  }

  if (isFirebaseConfigured() && db) {
    const q = query(collection(db, "pesanan"), orderBy("created_at", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
            created_at: d.data().created_at?.toDate?.() || new Date(d.data().created_at || Date.now()),
          }))
          .filter((o) => orderIds.includes(String(o.id)));
        callback(list);
      },
      (error) => {
        console.error("subscribeCustomerOrders error:", error);
        const all = getLocal("orders", []);
        callback(all.filter((o) => orderIds.includes(String(o.id))));
      }
    );
  }

  const all = getLocal("orders", []);
  callback(all.filter((o) => orderIds.includes(String(o.id))));
  return () => {};
}

export async function createOrder(orderData) {
  const payload = {
    ...orderData,
    kantin_id: String(orderData.kantin_id),
    status: typeof orderData.status === "number" ? orderData.status : 0,
    created_at: new Date().toISOString(),
  };

  if (isFirebaseConfigured() && db) {
    const docRef = await addDoc(collection(db, "pesanan"), {
      ...payload,
      created_at: serverTimestamp(),
    });
    return docRef.id;
  }

  const all = getLocal("orders", []);
  const newId = `ord-${Date.now().toString().slice(-6)}`;
  const newOrder = { ...payload, id: newId };
  setLocal("orders", [newOrder, ...all]);
  return newId;
}

export async function updateOrderStatus(orderId, newStatus) {
  if (isFirebaseConfigured() && db) {
    const ref = doc(db, "pesanan", String(orderId));
    await updateDoc(ref, { status: newStatus });
    return;
  }
  const all = getLocal("orders", []);
  const updated = all.map((o) => (String(o.id) === String(orderId) ? { ...o, status: newStatus } : o));
  setLocal("orders", updated);
}

/* ==========================================================================
   Penjualan Offline & Pengeluaran (Finansial)
   ========================================================================== */

export async function addOfflineSale(saleData) {
  if (isFirebaseConfigured() && db) {
    await addDoc(collection(db, "penjualan_offline"), {
      ...saleData,
      created_at: serverTimestamp(),
    });
    return;
  }
  const all = getLocal("offline_sales", []);
  setLocal("offline_sales", [...all, { ...saleData, id: `off-${Date.now()}` }]);
}

export function subscribeOfflineSales(kantinId, callback) {
  if (isFirebaseConfigured() && db) {
    const q = query(
      collection(db, "penjualan_offline"),
      where("kantin_id", "==", String(kantinId))
    );
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    });
  }
  const all = getLocal("offline_sales", []);
  callback(all.filter((s) => String(s.kantin_id) === String(kantinId)));
  return () => {};
}

export async function deleteOfflineSale(id) {
  if (isFirebaseConfigured() && db) {
    await deleteDoc(doc(db, "penjualan_offline", String(id)));
    return;
  }
  const all = getLocal("offline_sales", []);
  setLocal("offline_sales", all.filter((s) => String(s.id) !== String(id)));
}

export async function addExpense(expenseData) {
  if (isFirebaseConfigured() && db) {
    await addDoc(collection(db, "pengeluaran"), {
      ...expenseData,
      created_at: serverTimestamp(),
    });
    return;
  }
  const all = getLocal("expenses", []);
  setLocal("expenses", [...all, { ...expenseData, id: `exp-${Date.now()}` }]);
}

export function subscribeExpenses(kantinId, callback) {
  if (isFirebaseConfigured() && db) {
    const q = query(
      collection(db, "pengeluaran"),
      where("kantin_id", "==", String(kantinId))
    );
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    });
  }
  const all = getLocal("expenses", []);
  callback(all.filter((e) => String(e.kantin_id) === String(kantinId)));
  return () => {};
}

export async function deleteExpense(id) {
  if (isFirebaseConfigured() && db) {
    await deleteDoc(doc(db, "pengeluaran", String(id)));
    return;
  }
  const all = getLocal("expenses", []);
  setLocal("expenses", all.filter((e) => String(e.id) !== String(id)));
}
