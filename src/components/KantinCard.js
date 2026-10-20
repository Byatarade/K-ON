"use client";

export default function KantinCard({ kantin, menuCount = 0, onSelect }) {
  const isOpen = kantin.buka !== false;

  const handleClick = () => {
    if (!isOpen) {
      alert("Maaf, kantin ini sedang tutup. Coba lagi nanti ya! 🙏");
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
      <div className="kantin-card-media" style={{ backgroundColor: "var(--bg-tertiary)" }}>
        {kantin.foto_url ? (
          <img src={kantin.foto_url} alt={kantin.nama} loading="lazy" />
        ) : (
          <span style={{ fontSize: "3.2rem" }}>{kantin.emoji || "🏪"}</span>
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
