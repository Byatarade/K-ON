"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Store,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { loginSiswa, loginKantinUser } from "@/lib/firestore";

export default function LoginPage() {
  const router = useRouter();

  // Role: "siswa" | "kantin"
  const [role, setRole] = useState("siswa");

  // Siswa Form
  const [siswaEmail, setSiswaEmail] = useState("");
  const [siswaPassword, setSiswaPassword] = useState("");

  // Kantin Form
  const [kantinUsername, setKantinUsername] = useState("");
  const [kantinPassword, setKantinPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Jika sudah pernah login sebelumnya, redirect langsung
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("kon_auth_user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.role === "kantin") {
          router.replace("/dashboard");
        } else {
          router.replace("/");
        }
      }
    } catch (e) {}
  }, [router]);

  const handleSiswaSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const user = await loginSiswa({ email: siswaEmail, password: siswaPassword });
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
      router.push("/");
    } catch (err) {
      if (err.message === "NOT_FOUND") {
        setErrorMsg("Email siswa belum terdaftar. Silakan daftar terlebih dahulu.");
      } else if (err.message === "INVALID_PASSWORD") {
        setErrorMsg("Password salah. Silakan periksa kembali password Anda.");
      } else {
        setErrorMsg("Gagal masuk. Silakan periksa koneksi Anda.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKantinSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const kantin = await loginKantinUser({
        username: kantinUsername,
        password: kantinPassword,
      });
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
        setErrorMsg("Gagal masuk. Silakan periksa koneksi Anda.");
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
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "32px 28px",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          border: "1px solid var(--border-default)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 12px",
              borderRadius: "14px",
              background: "var(--primary-subtle)",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {role === "siswa" ? <GraduationCap size={28} /> : <Store size={28} />}
          </div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, margin: 0 }}>
            Masuk ke K-ON
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {role === "siswa"
              ? "Masuk sebagai Siswa untuk memesan jajan"
              : "Masuk sebagai Pengelola Ibu Kantin"}
          </p>
        </div>

        {/* Pilihan Peran: Siswa vs Ibu Kantin */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px",
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
            <Store size={16} />
            Ibu Kantin
          </button>
        </div>

        {/* Error Alert */}
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

        {/* FORM LOGIN SISWA */}
        {role === "siswa" && (
          <form onSubmit={handleSiswaSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={14} /> Email Siswa
              </label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="contoh: budi@siswa.smk"
                value={siswaEmail}
                onChange={(e) => setSiswaEmail(e.target.value)}
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
                value={siswaPassword}
                onChange={(e) => setSiswaPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ marginTop: "8px" }}
            >
              {loading ? "Memverifikasi..." : "Masuk ke Kantin Online"}
            </button>
          </form>
        )}

        {/* FORM LOGIN IBU KANTIN */}
        {role === "kantin" && (
          <form onSubmit={handleKantinSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} /> Username Kantin
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Username akun kantin"
                value={kantinUsername}
                onChange={(e) => setKantinUsername(e.target.value)}
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
                value={kantinPassword}
                onChange={(e) => setKantinPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ marginTop: "8px" }}
            >
              {loading ? "Memverifikasi..." : "Masuk ke Dashboard Kantin"}
            </button>
          </form>
        )}

        {/* Footer Link ke Halaman Daftar Terpisah */}
        <div
          style={{
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border-default)",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
          }}
        >
          <span>Belum punya akun? </span>
          <Link
            href={`/daftar?role=${role}`}
            style={{
              color: "var(--color-primary)",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Daftar {role === "siswa" ? "Siswa Baru" : "Kantin Baru"} <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
