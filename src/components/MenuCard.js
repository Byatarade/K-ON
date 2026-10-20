"use client";

import { formatRupiah } from "@/lib/utils";

export default function MenuCard({
  menu,
  cartQty = 0,
  onAddToCart,
  onRemoveFromCart,
}) {
  const isAvailable = menu.tersedia !== false;

  return (
    <div className="menu-card">
      <div className="menu-card-media">
        {menu.foto_url ? (
          <img src={menu.foto_url} alt={menu.nama} loading="lazy" />
        ) : (
          <span>{menu.emoji || "🍽️"}</span>
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
              >
                −
              </button>
              <span className="qty-val">{cartQty}</span>
              <button
                className="qty-btn"
                onClick={() => onAddToCart(menu.id)}
                aria-label="Tambah satu"
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm btn-block"
              onClick={() => onAddToCart(menu.id)}
            >
              + Pesan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
