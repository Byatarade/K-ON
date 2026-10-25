"use client";

import { formatRupiah } from "@/lib/utils";
import { Utensils, Coffee, Cookie, Plus, Minus } from "lucide-react";

export default function MenuCard({
  menu,
  cartQty = 0,
  onAddToCart,
  onRemoveFromCart,
}) {
  const isAvailable = menu.tersedia !== false;

  // Icon selector based on category
  const renderCategoryIcon = () => {
    const cat = (menu.kategori || "").toLowerCase();
    if (cat.includes("minum")) {
      return <Coffee size={36} strokeWidth={1.5} color="var(--color-primary)" />;
    }
    if (cat.includes("snack") || cat.includes("camilan")) {
      return <Cookie size={36} strokeWidth={1.5} color="var(--color-primary)" />;
    }
    return <Utensils size={36} strokeWidth={1.5} color="var(--color-primary)" />;
  };

  return (
    <div className="menu-card">
      <div
        className="menu-card-media"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-tertiary)",
        }}
      >
        {menu.foto_url ? (
          <img src={menu.foto_url} alt={menu.nama} loading="lazy" />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {renderCategoryIcon()}
          </div>
        )}

        <span className="menu-card-price-badge">
          {formatRupiah(menu.harga)}
        </span>

        {!isAvailable && (
          <div className="sold-out-overlay">
            <span className="sold-out-label">HABIS</span>
          </div>
        )}
      </div>

      <div className="menu-card-body">
        <h4 className="menu-card-name">{menu.nama}</h4>
        <span className="menu-card-category">{menu.kategori || "Menu"}</span>

        <div className="menu-card-action">
          {!isAvailable ? (
            <button className="btn btn-secondary btn-sm btn-block" disabled>
              Habis
            </button>
          ) : cartQty > 0 ? (
            <div className="qty-control">
              <button
                className="qty-btn"
                onClick={() => onRemoveFromCart(menu.id)}
                aria-label="Kurang satu"
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Minus size={14} />
              </button>
              <span className="qty-val">{cartQty}</span>
              <button
                className="qty-btn"
                onClick={() => onAddToCart(menu.id)}
                aria-label="Tambah satu"
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm btn-block"
              onClick={() => onAddToCart(menu.id)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
            >
              <Plus size={14} /> Pesan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
