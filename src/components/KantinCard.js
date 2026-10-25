"use client";

import { Store } from "lucide-react";

export default function KantinCard({ kantin, menuCount = 0, onSelect }) {
  const isOpen = kantin.buka !== false;

  const handleClick = () => {
    if (!isOpen) {
      alert("Maaf, kantin ini sedang tutup. Silakan pilih kantin lain yang buka.");
      return;
    }
    onSelect(kantin);
  };

  return (
    <div
      className={`card ${isOpen ? "card-clickable" : "card-disabled"}`}
      onClick={handleClick}
      role="button"
      tabIndex={isOpen ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick();
      }}
    >
      <div
        className="kantin-card-media"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {kantin.foto_url ? (
          <img src={kantin.foto_url} alt={kantin.nama} loading="lazy" />
        ) : (
          <div
            style={{
              color: "var(--color-primary)",
              opacity: 0.8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Store size={48} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="kantin-card-body">
        <h3 className="kantin-card-title">{kantin.nama}</h3>
        <div className="kantin-card-meta">
          <span>{isOpen ? `${menuCount} menu tersedia` : "Sedang tutup"}</span>
          <span className={`status-pill ${isOpen ? "open" : "closed"}`}>
            <span className="status-dot" />
            {isOpen ? "Buka" : "Tutup"}
          </span>
        </div>
      </div>
    </div>
  );
}
