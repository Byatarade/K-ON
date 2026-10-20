/**
 * Default Seed Data for K-ON Kantin Online
 */

export const DEFAULT_KANTIN = [
  {
    id: "1",
    nama: "Kantin Ibu Dyah",
    emoji: "🍲",
    warna: "#F97316",
    username: "Ibu Dyah",
    password: "ibudyah1",
    buka: true,
    foto_url: null,
    qr_url: null,
  },
  {
    id: "2",
    nama: "Kantin Pelangi",
    emoji: "🌈",
    warna: "#EC4899",
    username: "Kantin Pelangi",
    password: "Viska06",
    buka: true,
    foto_url: null,
    qr_url: null,
  },
  {
    id: "3",
    nama: "Kantin Hebat",
    emoji: "💪",
    warna: "#3B82F6",
    username: "Hebatt",
    password: "Hebat01",
    buka: true,
    foto_url: null,
    qr_url: null,
  },
];

export const DEFAULT_MENU = [
  // Kantin Ibu Dyah (ID: 1)
  { id: "m-1", kantin_id: "1", nama: "Nasi Pecel", emoji: "🥗", harga: 8000, modal: 5000, kategori: "Makanan", tersedia: true, foto_url: null },
  { id: "m-2", kantin_id: "1", nama: "Soto Ayam", emoji: "🍲", harga: 12000, modal: 8000, kategori: "Makanan", tersedia: true, foto_url: null },
  { id: "m-3", kantin_id: "1", nama: "Ayam Goreng", emoji: "🍗", harga: 13000, modal: 9000, kategori: "Makanan", tersedia: true, foto_url: null },
  { id: "m-4", kantin_id: "1", nama: "Gado-gado", emoji: "🥬", harga: 9000, modal: 6000, kategori: "Makanan", tersedia: true, foto_url: null },
  { id: "m-5", kantin_id: "1", nama: "Kerupuk", emoji: "🍘", harga: 2000, modal: 1000, kategori: "Snack", tersedia: true, foto_url: null },
  { id: "m-6", kantin_id: "1", nama: "Es Teh Manis", emoji: "🧋", harga: 3000, modal: 1000, kategori: "Minuman", tersedia: true, foto_url: null },
  { id: "m-7", kantin_id: "1", nama: "Es Jeruk", emoji: "🍊", harga: 4000, modal: 2000, kategori: "Minuman", tersedia: true, foto_url: null },

  // Kantin Pelangi (ID: 2)
  { id: "m-8", kantin_id: "2", nama: "Nasi Goreng", emoji: "🍳", harga: 10000, modal: 6500, kategori: "Makanan", tersedia: true, foto_url: null },
  { id: "m-9", kantin_id: "2", nama: "Mie Ayam", emoji: "🍜", harga: 12000, modal: 8000, kategori: "Makanan", tersedia: true, foto_url: null },
  { id: "m-10", kantin_id: "2", nama: "Bakso", emoji: "🍢", harga: 10000, modal: 6500, kategori: "Makanan", tersedia: true, foto_url: null },
  { id: "m-11", kantin_id: "2", nama: "Roti Bakar", emoji: "🍞", harga: 7000, modal: 4000, kategori: "Snack", tersedia: true, foto_url: null },
  { id: "m-12", kantin_id: "2", nama: "Jus Jeruk", emoji: "🍊", harga: 6000, modal: 3500, kategori: "Minuman", tersedia: true, foto_url: null },
  { id: "m-13", kantin_id: "2", nama: "Susu Coklat", emoji: "🥛", harga: 5000, modal: 3500, kategori: "Minuman", tersedia: true, foto_url: null },
  { id: "m-14", kantin_id: "2", nama: "Es Buah", emoji: "🍧", harga: 7000, modal: 4000, kategori: "Minuman", tersedia: true, foto_url: null },

  // Kantin Hebat (ID: 3)
  { id: "m-15", kantin_id: "3", nama: "Burger Mini", emoji: "🍔", harga: 9000, modal: 5500, kategori: "Makanan", tersedia: true, foto_url: null },
  { id: "m-16", kantin_id: "3", nama: "Nasi Kuning", emoji: "🍛", harga: 9000, modal: 6000, kategori: "Makanan", tersedia: true, foto_url: null },
  { id: "m-17", kantin_id: "3", nama: "Sosis Bakar", emoji: "🌭", harga: 6000, modal: 3500, kategori: "Snack", tersedia: true, foto_url: null },
  { id: "m-18", kantin_id: "3", nama: "Kentang Goreng", emoji: "🍟", harga: 6000, modal: 3000, kategori: "Snack", tersedia: true, foto_url: null },
  { id: "m-19", kantin_id: "3", nama: "Es Teh", emoji: "🧋", harga: 3000, modal: 1000, kategori: "Minuman", tersedia: true, foto_url: null },
  { id: "m-20", kantin_id: "3", nama: "Milkshake", emoji: "🥤", harga: 8000, modal: 4500, kategori: "Minuman", tersedia: true, foto_url: null },
];
