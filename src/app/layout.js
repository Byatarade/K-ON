import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "K-ON — Kantin Online Sekolah",
  description: "Aplikasi pemesanan makanan dan minuman kantin sekolah secara online, cepat, dan mudah.",
  keywords: ["kantin online", "sekolah", "k-on", "pesan makanan", "jajan kantin"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
