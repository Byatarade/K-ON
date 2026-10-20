"use client";

import { useState, useRef } from "react";

export default function TopBar({
  title = "K-ON 🎈",
  subtitle = "Kantin Online Sekolah",
  showBack = false,
  onBack,
  cartCount = 0,
  onOpenCart,
  onSecretTrigger,
}) {
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);

  const handleLogoClick = () => {
    tapCountRef.current += 1;
    clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 3000);

    if (tapCountRef.current >= 10) {
      tapCountRef.current = 0;
      if (onSecretTrigger) onSecretTrigger();
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-content">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {showBack && (
            <button
              className="icon-button"
              onClick={onBack}
              aria-label="Kembali"
              style={{ fontSize: "1rem", fontWeight: "700" }}
            >
              ←
            </button>
          )}

          <div>
            <div className="topbar-brand">{title}</div>
            {subtitle && <div className="page-subtitle" style={{ marginTop: 0 }}>{subtitle}</div>}
          </div>
        </div>

        <div className="topbar-actions">
          {onOpenCart && (
            <button
              className="icon-button"
              onClick={onOpenCart}
              aria-label="Buka Keranjang"
            >
              🛒
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </button>
          )}

          {/* K-ON Brand Logo (Clean SVG with Secret 10-tap gesture) */}
          <svg
            className="topbar-logo"
            viewBox="0 0 100 100"
            onClick={handleLogoClick}
            title="K-ON"
          >
            <circle cx="50" cy="50" r="46" fill="#F8F9FA" stroke="#E5E7EB" strokeWidth="3" />
            <path
              d="M36 24q-6 6 0 12M50 18q-6 7 0 14M64 24q-6 6 0 12"
              stroke="#2563EB"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M18 48h64a32 30 0 0 1-64 0z"
              fill="#2563EB"
              stroke="#1D4ED8"
              strokeWidth="2"
            />
            <ellipse cx="50" cy="48" rx="32" ry="6" fill="#F97316" />
            <circle cx="40" cy="62" r="3.5" fill="#FFFFFF" />
            <circle cx="60" cy="62" r="3.5" fill="#FFFFFF" />
            <path
              d="M44 68q6 6 12 0"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </header>
  );
}
