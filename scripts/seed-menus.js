/**
 * Script Query untuk Memperbanyak Menu ke-3 Kantin di Firebase Firestore
 * 
 * Cara menjalankan:
 *   node scripts/seed-menus.js
 */

const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...vals] = trimmed.split("=");
    if (key && vals.length) env[key.trim()] = vals.join("=").trim();
  });
  return env;
}

const env = loadEnv();

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDRYmh8lwrKH7EGNKKaBCBld_6PfRrlxho",
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "kantin-c6841.firebaseapp.com",
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kantin-c6841",
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "kantin-c6841.firebasestorage.app",
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "579998863181",
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:579998863181:web:66013b905777d58672f104",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data menu untuk masing-masing kantin
const MENU_SEEDS = [
  // 1. Ibu Suti
  {
    kantinUsername: "ibusuti",
    menus: [
      { nama: "Nasi Ayam Bakar", harga: 10000, modal: 7000, kategori: "Makanan" },
      { nama: "Soto Ayam Lamongan", harga: 12000, modal: 8000, kategori: "Makanan" },
      { nama: "Nasi Pecel Madiun", harga: 9000, modal: 6000, kategori: "Makanan" },
      { nama: "Es Teh Manis Jumbo", harga: 3000, modal: 1000, kategori: "Minuman" },
      { nama: "Es Jeruk Segar", harga: 4000, modal: 2000, kategori: "Minuman" },
      { nama: "Mendoan Crispy Gurih", harga: 5000, modal: 3000, kategori: "Snack" },
    ],
  },
  // 2. Kantin Bu Pony
  {
    kantinUsername: "bu pony",
    menus: [
      { nama: "Bakso Urat Mantap", harga: 12000, modal: 8000, kategori: "Makanan" },
      { nama: "Mie Ayam Pangsit", harga: 11000, modal: 7000, kategori: "Makanan" },
      { nama: "Nasi Goreng Spesial", harga: 12000, modal: 8000, kategori: "Makanan" },
      { nama: "Es Cincau Susu", harga: 5000, modal: 3000, kategori: "Minuman" },
      { nama: "Es Kopi Susu Gula Aren", harga: 6000, modal: 3500, kategori: "Minuman" },
      { nama: "Pisang Coklat Lumer", harga: 5000, modal: 3000, kategori: "Snack" },
    ],
  },
  // 3. Kantin Ibu Berkah
  {
    kantinUsername: "ibuberkah",
    menus: [
      { nama: "Nasi Kuning Komplit", harga: 10000, modal: 6500, kategori: "Makanan" },
      { nama: "Ayam Geprek Sambal Bawang", harga: 13000, modal: 9000, kategori: "Makanan" },
      { nama: "Tahu Telur Bumbu Petis", harga: 10000, modal: 6500, kategori: "Makanan" },
      { nama: "Es Milo Dingin", harga: 6000, modal: 4000, kategori: "Minuman" },
      { nama: "Jus Alpukat Kocok", harga: 8000, modal: 5000, kategori: "Minuman" },
      { nama: "Roti Bakar Coklat Keju", harga: 7000, modal: 4500, kategori: "Snack" },
      { nama: "Cireng Bumbu Rujak", harga: 5000, modal: 2500, kategori: "Snack" },
    ],
  },
];

async function seedMenus() {
  console.log("🚀 Menghubungkan ke Firebase Firestore:", firebaseConfig.projectId);

  // Ambil semua kantin dari Firestore
  const kSnap = await getDocs(collection(db, "kantin"));
  const kantinMap = {};
  kSnap.forEach((doc) => {
    const data = doc.data();
    const uname = (data.username || "").toLowerCase().trim();
    kantinMap[uname] = { id: doc.id, nama: data.nama };
  });

  console.log("Kantin ditemukan:", Object.keys(kantinMap));

  // Ambil semua menu yang sudah ada agar tidak duplikat nama pada kantin yang sama
  const mSnap = await getDocs(collection(db, "menu"));
  const existingMenuSet = new Set();
  mSnap.forEach((doc) => {
    const m = doc.data();
    existingMenuSet.add(`${m.kantin_id}__${m.nama.toLowerCase()}`);
  });

  let totalAdded = 0;

  for (const group of MENU_SEEDS) {
    const kInfo = kantinMap[group.kantinUsername.toLowerCase().trim()];
    if (!kInfo) {
      console.log(`⚠️ Kantin dengan username "${group.kantinUsername}" tidak ditemukan di database.`);
      continue;
    }

    console.log(`\n📌 Menambahkan menu untuk: ${kInfo.nama} (ID: ${kInfo.id})`);

    for (const menu of group.menus) {
      const key = `${kInfo.id}__${menu.nama.toLowerCase()}`;
      if (existingMenuSet.has(key)) {
        console.log(`   ⏩ Menu "${menu.nama}" sudah ada, dilewati.`);
        continue;
      }

      const docRef = await addDoc(collection(db, "menu"), {
        kantin_id: String(kInfo.id),
        nama: menu.nama,
        harga: Number(menu.harga),
        modal: Number(menu.modal),
        kategori: menu.kategori,
        tersedia: true,
        foto_url: null,
        created_at: serverTimestamp(),
      });

      console.log(`   ✅ Ditambahkan: ${menu.nama} (${menu.kategori}) - Rp ${menu.harga.toLocaleString()} [ID: ${docRef.id}]`);
      existingMenuSet.add(key);
      totalAdded++;
    }
  }

  console.log(`\n🎉 SELESAI! Berhasil menambahkan total ${totalAdded} menu baru ke Firestore!`);
  process.exit(0);
}

seedMenus().catch((err) => {
  console.error("❌ Terjadi kesalahan saat seed menu:", err);
  process.exit(1);
});
