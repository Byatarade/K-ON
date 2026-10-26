"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, GraduationCap, Store, ChefHat, LogOut, Bell } from "lucide-react";

export default function TopBar({
  title = "K-ON",
  subtitle = "Kantin Online Sekolah",
  showBack = false,
  onBack,
  cartCount = 0,
  onOpenCart,
  unreadNotifCount = 0,
  onOpenNotifications,
  currentUser = null,
  onLogout,
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

  const isKantin = currentUser?.role === "kantin";

  return (
    <header className="topbar">
      <div className="topbar-content">
        <div className="topbar-left">
          {showBack && (
            <button
              className="icon-button"
              onClick={onBack}
              aria-label="Kembali"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div style={{ minWidth: 0 }}>
            <div className="topbar-brand">{title}</div>
            {subtitle && (
              <div className="topbar-subtitle" title={subtitle}>
                {subtitle}
              </div>
            )}
          </div>
        </div>

        <div className="topbar-actions">
          {/* User pill info */}
          {currentUser && (
            <div
              className="topbar-user-pill"
              title={`${currentUser.nama || ""} (${currentUser.kelas || ""})`}
            >
              {isKantin ? (
                <>
                  <Store size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                  <span className="user-pill-name">{currentUser.nama?.split(" ")[0]}</span>
                  <span className="user-pill-class"> (Ibu Kantin)</span>
                </>
              ) : (
                <>
                  <GraduationCap size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                  <span className="user-pill-name">{currentUser.nama?.split(" ")[0]}</span>
                  <span className="user-pill-class"> ({currentUser.kelas || "Siswa"})</span>
                </>
              )}
            </div>
          )}

          {/* Quick link back to dashboard if role is kantin */}
          {isKantin && (
            <Link
              href="/dashboard"
              className="btn btn-secondary btn-sm"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.75rem",
                padding: "6px 10px",
                textDecoration: "none",
              }}
            >
              <ChefHat size={14} /> Dashboard
            </Link>
          )}

          {/* Notification Bell Button */}
          {onOpenNotifications && (
            <button
              className="icon-button"
              onClick={onOpenNotifications}
              aria-label="Pemberitahuan"
              title="Pusat Pemberitahuan"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
            >
              <Bell size={20} />
              {unreadNotifCount > 0 && (
                <span className="badge-count" style={{ backgroundColor: "var(--color-danger)" }}>
                  {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                </span>
              )}
            </button>
          )}

          {onOpenCart && (
            <button
              className="icon-button"
              onClick={onOpenCart}
              aria-label="Buka Keranjang"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
            </button>
          )}

          {/* Logout button if logged in */}
          {currentUser && onLogout && (
            <button
              className="icon-button"
              onClick={onLogout}
              aria-label="Keluar"
              title="Keluar dari akun"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <LogOut size={18} />
            </button>
          )}

          {/* K-ON Brand Logo */}
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
