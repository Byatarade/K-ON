"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Lock, User, X, AlertCircle } from "lucide-react";
import { loginKantinUser } from "@/lib/firestore";

export default function LoginModal({ isOpen, onClose, kantinList = [] }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const kantin = await loginKantinUser({ username, password });
      if (typeof window !== "undefined") {
        localStorage.setItem("kon_seller_id", String(kantin.id));
        localStorage.setItem(
          "kon_auth_user",
          JSON.stringify({
            id: String(kantin.id),
            nama: kantin.nama,
            username: kantin.username,
            role: "kantin",
          })
        );
      }
      onClose();
      router.push("/dashboard");
    } catch (err) {
      // Fallback matching against kantinList props
      const matched = kantinList.find(
        (k) =>
          k.username?.toLowerCase() === username.trim().toLowerCase() &&
          k.password === password.trim()
      );
      if (matched) {
        if (typeof window !== "undefined") {
          localStorage.setItem("kon_seller_id", String(matched.id));
          localStorage.setItem(
            "kon_auth_user",
            JSON.stringify({
              id: String(matched.id),
              nama: matched.nama,
              username: matched.username,
              role: "kantin",
            })
          );
        }
        onClose();
        router.push("/dashboard");
      } else {
        setErrorMsg("Username atau password salah. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Store size={20} color="var(--color-primary)" />
            <h3 className="modal-title">Masuk Ibu Kantin</h3>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <User size={14} /> Username Akun Kantin
            </label>
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
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Lock size={14} /> Password
            </label>
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
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--color-danger)",
                fontSize: "0.8125rem",
                marginBottom: "14px",
                fontWeight: "500",
              }}
            >
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-block"
            style={{ marginTop: "8px" }}
            onClick={() => {
              onClose();
              router.push("/daftar");
            }}
          >
            Belum punya akun? Daftar Kantin
          </button>
        </form>
      </div>
    </div>
  );
}
