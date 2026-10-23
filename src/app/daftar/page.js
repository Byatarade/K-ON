"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerKantin } from "@/lib/firestore";

export default function DaftarKantinPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nama: "", emoji: "🏪", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    setLoading(true);
    try {
      const id = await registerKantin(form);
      localStorage.setItem("kon_seller_id", String(id));
      router.push("/dashboard");
    } catch (err) {
      setError(
        err.message === "USERNAME_TAKEN"
          ? "Username sudah dipakai, pilih yang lain."
          : "Gagal mendaftar. Coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-container" style={{ paddingTop: "24px" }}>
      <div className="page-header">
        <h1 className="page-title">👩‍🍳 Daftar Akun Kantin</h1>
        <p className="page-subtitle">Setiap ibu kantin punya akun dan dashboard sendiri.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="nama">Nama Kantin *</label>
          <input id="nama" className="form-input" maxLength={30} required
            placeholder="Contoh: Kantin Ibu Sari" value={form.nama} onChange={set("nama")} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="emoji">Emoji Kantin</label>
          <input id="emoji" className="form-input" maxLength={4}
            value={form.emoji} onChange={set("emoji")} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="username">Username *</label>
          <input id="username" className="form-input" maxLength={20} required autoComplete="off"
            value={form.username} onChange={set("username")} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="password">Password *</label>
          <input id="password" type="password" className="form-input" required
            value={form.password} onChange={set("password")} />
        </div>

        {error && (
          <div style={{ color: "var(--color-danger)", fontSize: "0.8125rem", marginBottom: "14px", fontWeight: 500 }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? "Mendaftarkan..." : "Daftar & Masuk Dashboard"}
        </button>
        <Link href="/" className="btn btn-secondary btn-block" style={{ marginTop: "8px", textAlign: "center" }}>
          Kembali ke Beranda
        </Link>
      </form>
    </main>
  );
}
