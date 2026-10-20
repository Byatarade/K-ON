"use client";

import { formatRupiah } from "@/lib/utils";

export default function FloatingCartBar({ itemCount, totalPrice, onOpenCart }) {
  if (itemCount <= 0) return null;

  return (
    <div className="floating-cart-bar">
      <div
        className="floating-cart-content"
        onClick={onOpenCart}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onOpenCart();
        }}
      >
        <div className="cart-bar-info">
          <span className="cart-bar-badge">🛒 {itemCount} item</span>
          <span className="cart-bar-total">{formatRupiah(totalPrice)}</span>
        </div>
        <span className="cart-bar-action">
          Lanjut ke Pesanan →
        </span>
      </div>
    </div>
  );
}
