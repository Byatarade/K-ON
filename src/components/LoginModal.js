"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginModal({ isOpen, onClose, kantinList = [] }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const matchedKantin = kantinList.find(
      (k) =>
        k.username?.toLowerCase() === username.trim().toLowerCase() &&
        k.password === password.trim()
    );

    if (matchedKantin) {
      // Store logged in seller kantin id in session / local storage
      if (typeof window !== "undefined") {
        localStorage.setItem("kon_seller_id", String(matchedKantin.id));
      }
      onClose();
      router.push("/dashboard");
    } else {
      setErrorMsg("Username atau password salah. Silakan coba lagi.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">🔐 Masuk Penjual Kantin</h3>
          <button className="close-btn" onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username Penjual</label>
            <input
              className="form-input"
              type="text"
              placeholder="Username akun kantin"
              autoComplete="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Password akun kantin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {errorMsg && (
            <div
              style={{
                color: "var(--color-danger)",
                fontSize: "0.8125rem",
                marginBottom: "14px",
                fontWeight: "500",
              }}
            >
              {errorMsg}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block btn-lg">
            Masuk ke Dashboard
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-block"
            style={{ marginTop: "8px" }}
            onClick={onClose}
          >
            Batal
          </button>
        </form>
      </div>
    </div>
  );
}
