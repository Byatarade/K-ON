"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Store,
  Mail,
  Lock,
  User,
  School,
  ArrowRight,
  ChefHat,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { loginSiswa, registerSiswa, loginKantinUser, registerKantin } from "@/lib/firestore";

export default function AuthGate({ onLoginSuccess }) {
  const router = useRouter();

  // Role mode: "siswa" | "kantin"
  const [role, setRole] = useState("siswa");
  // Auth action: "login" | "register"
  const [action, setAction] = useState("login");

  // Form states
  const [siswaLogin, setSiswaLogin] = useState({ email: "budi@siswa.smk", password: "password123" });
  const [siswaRegister, setSiswaRegister] = useState({
    nama: "",
    email: "",
    kelas: "",
    password: "",
  });

  const [kantinLogin, setKantinLogin] = useState({ username: "", password: "" });
  const [kantinRegister, setKantinRegister] = useState({
    nama: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSiswaLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const user = await loginSiswa(siswaLogin);
      const authData = {
        id: String(user.id),
        nama: user.nama,
        email: user.email,
        kelas: user.kelas,
        role: "siswa",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("kon_auth_user", JSON.stringify(authData));
      }
      if (onLoginSuccess) {
        onLoginSuccess(authData);
      }
    } catch (err) {
      if (err.message === "NOT_FOUND") {
        setErrorMsg("Email siswa belum terdaftar. Silakan pilih tab 'Daftar Siswa Baru'.");
      } else if (err.message === "INVALID_PASSWORD") {
        setErrorMsg("Password salah. Silakan periksa kembali password Anda.");
      } else {
        setErrorMsg("Gagal masuk. Pastikan koneksi stabil atau coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSiswaRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (siswaRegister.password.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      const user = await registerSiswa(siswaRegister);
      const authData = {
        id: String(user.id),
        nama: user.nama,
        email: user.email,
        kelas: user.kelas,
        role: "siswa",
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("kon_auth_user", JSON.stringify(authData));
      }
      setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke beranda...");
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(authData);
      }, 600);
    } catch (err) {
      if (err.message === "EMAIL_TAKEN") {
        setErrorMsg("Email ini sudah digunakan. Silakan login atau gunakan email lain.");
      } else {
        setErrorMsg("Pendaftaran gagal. Silakan coba kembali.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKantinLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const kantin = await loginKantinUser(kantinLogin);
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
      router.push("/dashboard");
    } catch (err) {
      if (err.message === "NOT_FOUND") {
        setErrorMsg("Akun kantin tidak ditemukan. Pastikan username sudah benar.");
      } else if (err.message === "INVALID_PASSWORD") {
        setErrorMsg("Password kantin salah.");
      } else {
        setErrorMsg("Gagal masuk. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKantinRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (kantinRegister.password.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      const kantinId = await registerKantin({
        nama: kantinRegister.nama,
        username: kantinRegister.username,
        password: kantinRegister.password,
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("kon_seller_id", String(kantinId));
        localStorage.setItem(
          "kon_auth_user",
          JSON.stringify({
            id: String(kantinId),
            nama: kantinRegister.nama,
            username: kantinRegister.username,
            role: "kantin",
          })
        );
      }
      router.push("/dashboard");
    } catch (err) {
      if (err.message === "USERNAME_TAKEN") {
        setErrorMsg("Username kantin sudah dipakai, gunakan username lain.");
      } else {
        setErrorMsg("Gagal mendaftarkan kantin. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "var(--bg-secondary)",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "32px 24px",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          border: "1px solid var(--border-default)",
          background: "var(--bg-primary)",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 12px",
              borderRadius: "16px",
              background: "var(--primary-subtle)",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {role === "siswa" ? <GraduationCap size={32} /> : <Store size={32} />}
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
            K-ON Kantin Sekolah
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {role === "siswa"
              ? "Silakan masuk untuk memesan jajanan kantin"
              : "Portal Pengelolaan Menu & Pesanan Ibu Kantin"}
          </p>
        </div>

        {/* Role Selector: Siswa vs Ibu Kantin */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            background: "var(--bg-secondary)",
            padding: "4px",
            borderRadius: "var(--radius-md)",
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              setRole("siswa");
              setAction("login");
              setErrorMsg("");
            }}
            style={{
              background: role === "siswa" ? "var(--bg-primary)" : "transparent",
              color: role === "siswa" ? "var(--color-primary)" : "var(--text-secondary)",
              fontWeight: role === "siswa" ? 700 : 500,
              boxShadow: role === "siswa" ? "0 2px 4px rgba(0,0,0,0.04)" : "none",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <GraduationCap size={16} />
            Siswa
          </button>

          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              setRole("kantin");
              setAction("login");
              setErrorMsg("");
            }}
            style={{
              background: role === "kantin" ? "var(--bg-primary)" : "transparent",
              color: role === "kantin" ? "var(--color-primary)" : "var(--text-secondary)",
              fontWeight: role === "kantin" ? 700 : 500,
              boxShadow: role === "kantin" ? "0 2px 4px rgba(0,0,0,0.04)" : "none",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <ChefHat size={16} />
            Ibu Kantin
          </button>
        </div>

        {/* Action Selector: Login vs Register */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border-default)",
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAction("login");
              setErrorMsg("");
            }}
            style={{
              flex: 1,
              padding: "10px",
              background: "none",
              border: "none",
              borderBottom: action === "login" ? "2px solid var(--color-primary)" : "none",
              color: action === "login" ? "var(--color-primary)" : "var(--text-secondary)",
              fontWeight: action === "login" ? 700 : 500,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            {role === "siswa" ? "Masuk Siswa" : "Masuk Kantin"}
          </button>

          <button
            type="button"
            onClick={() => {
              setAction("register");
              setErrorMsg("");
            }}
            style={{
              flex: 1,
              padding: "10px",
              background: "none",
              border: "none",
              borderBottom: action === "register" ? "2px solid var(--color-primary)" : "none",
              color: action === "register" ? "var(--color-primary)" : "var(--text-secondary)",
              fontWeight: action === "register" ? 700 : 500,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            {role === "siswa" ? "Daftar Siswa Baru" : "Daftar Kantin Baru"}
          </button>
        </div>

        {/* Feedback Alert */}
        {errorMsg && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              color: "var(--color-danger)",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.8125rem",
              marginBottom: "16px",
              fontWeight: 500,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(16, 185, 129, 0.08)",
              color: "var(--color-success)",
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.8125rem",
              marginBottom: "16px",
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================
            MODE SISWA
           ======================================================== */}
        {role === "siswa" && action === "login" && (
          <form onSubmit={handleSiswaLogin}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={14} /> Email Siswa
              </label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="budi@siswa.smk"
                value={siswaLogin.email}
                onChange={(e) => setSiswaLogin({ ...siswaLogin, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Lock size={14} /> Password
              </label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="Masukkan password"
                value={siswaLogin.password}
                onChange={(e) => setSiswaLogin({ ...siswaLogin, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? "Memverifikasi..." : "Masuk ke Kantin Online"}
            </button>
          </form>
        )}

        {role === "siswa" && action === "register" && (
          <form onSubmit={handleSiswaRegister}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} /> Nama Lengkap
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Contoh: Budi Santoso"
                value={siswaRegister.nama}
                onChange={(e) => setSiswaRegister({ ...siswaRegister, nama: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={14} /> Email Siswa
              </label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="budi@siswa.smk"
                value={siswaRegister.email}
                onChange={(e) => setSiswaRegister({ ...siswaRegister, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <School size={14} /> Kelas
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Contoh: XII RPL 1"
                value={siswaRegister.kelas}
                onChange={(e) => setSiswaRegister({ ...siswaRegister, kelas: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Lock size={14} /> Password (min. 6 karakter)
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                placeholder="Buat password"
                value={siswaRegister.password}
                onChange={(e) => setSiswaRegister({ ...siswaRegister, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? "Mendaftarkan..." : "Daftar & Masuk"}
            </button>
          </form>
        )}

        {/* ========================================================
            MODE IBU KANTIN
           ======================================================== */}
        {role === "kantin" && action === "login" && (
          <form onSubmit={handleKantinLogin}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} /> Username Kantin
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Contoh: bu pony atau ibuberkah"
                value={kantinLogin.username}
                onChange={(e) => setKantinLogin({ ...kantinLogin, username: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Lock size={14} /> Password
              </label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="Password kantin"
                value={kantinLogin.password}
                onChange={(e) => setKantinLogin({ ...kantinLogin, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? "Masuk..." : "Masuk ke Dashboard Kantin"}
            </button>
          </form>
        )}

        {role === "kantin" && action === "register" && (
          <form onSubmit={handleKantinRegister}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Store size={14} /> Nama Kantin
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Contoh: Kantin Berkah Jaya"
                value={kantinRegister.nama}
                onChange={(e) => setKantinRegister({ ...kantinRegister, nama: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} /> Username Kantin (untuk login)
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Contoh: kantinberkah"
                value={kantinRegister.username}
                onChange={(e) => setKantinRegister({ ...kantinRegister, username: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Lock size={14} /> Password (min. 6 karakter)
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                placeholder="Buat password kantin"
                value={kantinRegister.password}
                onChange={(e) => setKantinRegister({ ...kantinRegister, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? "Mendaftarkan..." : "Daftar Akun Kantin"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
