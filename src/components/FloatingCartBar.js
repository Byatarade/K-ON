"use client";

import { formatRupiah } from "@/lib/utils";
import { ShoppingBag, ArrowRight } from "lucide-react";

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
        <div className="cart-bar-info" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            className="cart-bar-badge"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ShoppingBag size={14} />
            {itemCount} item
          </span>
          <span className="cart-bar-total">{formatRupiah(totalPrice)}</span>
        </div>
        <span
          className="cart-bar-action"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          Lanjut ke Pesanan <ArrowRight size={15} />
        </span>
      </div>
    </div>
  );
}
