export default function manifest() {
  return {
    name: "K-ON — Kantin Online Sekolah",
    short_name: "K-ON",
    description: "Pesan makanan & minuman kantin sekolah secara online.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFFFF",
    theme_color: "#2563EB",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
