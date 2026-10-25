"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Store,
  Mail,
  Lock,
  User,
  School,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { registerSiswa, registerKantin } from "@/lib/firestore";

function DaftarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Role: "siswa" | "kantin"
  const [role, setRole] = useState("siswa");

  // Siswa Form
  const [siswa, setSiswa] = useState({
    nama: "",
    email: "",
    kelas: "",
    password: "",
  });

  // Kantin Form
  const [kantin, setKantin] = useState({
    nama: "",
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const r = searchParams.get("role");
    if (r === "kantin") {
      setRole("kantin");
    } else {
      setRole("siswa");
    }
  }, [searchParams]);

  const handleSiswaRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (siswa.password.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      const user = await registerSiswa(siswa);
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
        router.push("/");
      }, 700);
    } catch (err) {
      if (err.message === "EMAIL_TAKEN") {
        setErrorMsg("Email sudah terdaftar. Silakan login atau gunakan email lain.");
      } else {
        setErrorMsg("Gagal mendaftar. Silakan periksa koneksi dan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKantinRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (kantin.password.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      const id = await registerKantin({
        nama: kantin.nama,
        username: kantin.username,
        password: kantin.password,
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("kon_seller_id", String(id));
        localStorage.setItem(
          "kon_auth_user",
          JSON.stringify({
            id: String(id),
            nama: kantin.nama,
            username: kantin.username,
            role: "kantin",
          })
        );
      }
      setSuccessMsg("Kantin berhasil didaftarkan! Mengalihkan ke dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } catch (err) {
      if (err.message === "USERNAME_TAKEN") {
        setErrorMsg("Username sudah dipakai oleh kantin lain. Pilih username lain.");
      } else {
        setErrorMsg("Gagal mendaftar kantin. Silakan coba lagi.");
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
            Daftar Akun Baru
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {role === "siswa"
              ? "Daftar sebagai Siswa untuk mulai memesan jajan"
              : "Daftar Akun Pengelola Kantin Sekolah"}
          </p>
        </div>

        {/* Pilihan Peran: Daftar Siswa vs Daftar Ibu Kantin */}
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
              setSuccessMsg("");
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
            Daftar Siswa
          </button>

          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              setRole("kantin");
              setErrorMsg("");
              setSuccessMsg("");
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
            Daftar Kantin
          </button>
        </div>

        {/* Alert Error / Success */}
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

        {/* FORM DAFTAR SISWA */}
        {role === "siswa" && (
          <form onSubmit={handleSiswaRegister}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} /> Nama Lengkap Siswa *
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Contoh: Budi Santoso"
                maxLength={40}
                value={siswa.nama}
                onChange={(e) => setSiswa({ ...siswa, nama: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={14} /> Email Siswa *
              </label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="budi@siswa.smk"
                value={siswa.email}
                onChange={(e) => setSiswa({ ...siswa, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <School size={14} /> Kelas *
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Contoh: XII RPL 1"
                maxLength={16}
                value={siswa.kelas}
                onChange={(e) => setSiswa({ ...siswa, kelas: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Lock size={14} /> Password (min. 6 karakter) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                placeholder="Buat password akun"
                value={siswa.password}
                onChange={(e) => setSiswa({ ...siswa, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ marginTop: "8px" }}
            >
              {loading ? "Mendaftarkan..." : "Daftar Akun Siswa"}
            </button>
          </form>
        )}

        {/* FORM DAFTAR IBU KANTIN */}
        {role === "kantin" && (
          <form onSubmit={handleKantinRegister}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Store size={14} /> Nama Kantin *
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Contoh: Kantin Bu Ani"
                maxLength={30}
                value={kantin.nama}
                onChange={(e) => setKantin({ ...kantin, nama: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={14} /> Username Login *
              </label>
              <input
                type="text"
                required
                autoComplete="off"
                className="form-input"
                placeholder="Contoh: buani"
                maxLength={20}
                value={kantin.username}
                onChange={(e) => setKantin({ ...kantin, username: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Lock size={14} /> Password (min. 6 karakter) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                placeholder="Buat password kantin"
                value={kantin.password}
                onChange={(e) => setKantin({ ...kantin, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ marginTop: "8px" }}
            >
              {loading ? "Mendaftarkan..." : "Daftar Akun Kantin"}
            </button>
          </form>
        )}

        {/* Footer Link ke Halaman Login Terpisah */}
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
          <span>Sudah memiliki akun? </span>
          <Link
            href="/login"
            style={{
              color: "var(--color-primary)",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            Masuk di sini <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DaftarPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span>Memuat halaman pendaftaran...</span>
        </div>
      }
    >
      <DaftarForm />
    </Suspense>
  );
}
