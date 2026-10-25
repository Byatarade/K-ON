/**
 * Script untuk membuat Akun Buatan (Custom Account) langsung ke Firebase Firestore.
 * 
 * Cara menjalankan:
 *   node scripts/create-custom-account.js
 */

const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

// Baca .env.local jika ada
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

/**
 * 1. Fungsi menambah Akun Siswa Kustom ke Firestore
 */
async function createCustomSiswa({ nama, email, kelas, password }) {
  const emailNorm = email.trim().toLowerCase();
  const q = query(collection(db, "siswa"), where("email", "==", emailNorm));
  const snap = await getDocs(q);

  if (!snap.empty) {
    console.log(`⚠️  Akun siswa dengan email "${emailNorm}" sudah ada!`);
    return snap.docs[0].id;
  }

  const docRef = await addDoc(collection(db, "siswa"), {
    nama: nama.trim(),
    email: emailNorm,
    kelas: kelas.trim(),
    password: password,
    role: "siswa",
    created_at: serverTimestamp(),
  });

  console.log(`✅ Berhasil membuat akun Siswa: ${nama} (${emailNorm}) [ID: ${docRef.id}]`);
  return docRef.id;
}

/**
 * 2. Fungsi menambah Akun Ibu Kantin Kustom ke Firestore
 */
async function createCustomKantin({ nama, username, password, warna = "#2563EB" }) {
  const uname = username.trim().toLowerCase();
  const q = query(collection(db, "kantin"), where("username", "==", uname));
  const snap = await getDocs(q);

  if (!snap.empty) {
    console.log(`⚠️  Akun kantin dengan username "${uname}" sudah ada!`);
    return snap.docs[0].id;
  }

  const docRef = await addDoc(collection(db, "kantin"), {
    nama: nama.trim(),
    username: uname,
    password: password,
    warna: warna,
    buka: true,
    foto_url: null,
    qr_url: null,
    created_at: serverTimestamp(),
  });

  console.log(`✅ Berhasil membuat akun Ibu Kantin: ${nama} (username: ${uname}) [ID: ${docRef.id}]`);
  return docRef.id;
}

// CONTOH EKSEKUSI DATA KUSTOM:
async function main() {
  console.log("🚀 Menghubungkan ke Firebase:", firebaseConfig.projectId);

  // Buat contoh akun siswa: budi@siswa.smk
  await createCustomSiswa({
    nama: "Budi Santoso",
    email: "budi@siswa.smk",
    kelas: "XII RPL 1",
    password: "password123",
  });

  // Buat contoh akun siswa kedua
  await createCustomSiswa({
    nama: "Siti Rahma",
    email: "siti@siswa.smk",
    kelas: "XI TKJ 2",
    password: "password123",
  });

  // Buat contoh akun ibu kantin kustom jika diperlukan
  await createCustomKantin({
    nama: "Kantin Ibu Berkah",
    username: "ibuberkah",
    password: "kantinberkah123",
    warna: "#10B981",
  });

  console.log("🎉 Selesai menambahkan akun kustom ke Firebase!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Terjadi kesalahan:", err);
  process.exit(1);
});
