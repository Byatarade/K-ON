import { Inter } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "K-ON — Kantin Online Sekolah",
  description: "Aplikasi pemesanan makanan dan minuman kantin sekolah secara online, cepat, dan mudah.",
  keywords: ["kantin online", "sekolah", "k-on", "pesan makanan", "jajan kantin"],
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, title: "K-ON", statusBarStyle: "default" },
};

export const viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
