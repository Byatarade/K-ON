"use client";

import { useState, useEffect } from "react";
import { formatRupiah, ONGKIR_FLAT } from "@/lib/utils";
import DummyQR from "@/components/DummyQR";
import {
  ShoppingBag,
  Plus,
  Minus,
  Utensils,
  Truck,
  UserCheck,
  Banknote,
  QrCode,
  ArrowRight,
  X,
} from "lucide-react";

export default function CartModal({
  isOpen,
  onClose,
  kantin,
  cart,
  menuList,
  onAddToCart,
  onRemoveFromCart,
  onSubmitOrder,
  isSubmitting = false,
  currentUser = null,
}) {
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [isDelivery, setIsDelivery] = useState(false);
  const [payMethod, setPayMethod] = useState("tunai"); // "tunai" | "qr"
  const [catatan, setCatatan] = useState("");

  // Auto-fill from logged-in user
  useEffect(() => {
    if (currentUser) {
      if (currentUser.nama) setNama(currentUser.nama);
      if (currentUser.role === "kantin") {
        setKelas("Ibu Kantin");
        setJurusan("");
      } else if (currentUser.kelas) {
        setKelas(currentUser.kelas);
        setJurusan("");
      }
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  // Calculate items in cart
  const cartEntries = Object.entries(cart)
    .map(([menuId, qty]) => {
      const item = menuList.find((m) => String(m.id) === String(menuId));
      return item ? { ...item, qty } : null;
    })
    .filter(Boolean);

  const subtotal = cartEntries.reduce((sum, item) => sum + item.harga * item.qty, 0);
  const ongkir = isDelivery ? ONGKIR_FLAT : 0;
  const grandTotal = subtotal + ongkir;

  const handleSubmit = (e) => {
    e.preventDefault();
    submitOrder();
  };

  const submitOrder = () => {
    if (!nama.trim() || !kelas.trim()) {
      alert("Harap lengkapi nama dan kelas pemesan.");
      return;
    }
    if (cartEntries.length === 0) {
      alert("Keranjang belanja masih kosong.");
      return;
    }

    const orderPayload = {
      kantin_id: kantin.id,
      siswa_id: currentUser?.id || null,
      nama_pemesan: nama.trim(),
      kelas: kelas.trim(),
      jurusan: "",
      opsi_antar: isDelivery,
      status: payMethod === "qr" ? 1 : 0,
      sudah_bayar: payMethod === "qr",
      metode_bayar: payMethod,
      catatan: catatan.trim(),
      ongkir,
      total: grandTotal,
      items: cartEntries.map((it) => ({
        menu_id: it.id,
        nama: it.nama,
        jumlah: it.qty,
        harga: it.harga,
        modal: it.modal || 0,
      })),
    };

    onSubmitOrder(orderPayload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShoppingBag size={20} color="var(--color-primary)" />
            <div>
              <h3 className="modal-title">Keranjang Belanja</h3>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                {kantin?.nama || "Kantin"}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        {cartEntries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
              Keranjang masih kosong. Silakan pilih menu terlebih dahulu.
            </p>
            <button className="btn btn-secondary btn-block" onClick={onClose}>
              Pilih Menu
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* List of cart items */}
            <div style={{ marginBottom: "16px" }}>
              {cartEntries.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--border-default)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: "var(--bg-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-primary)",
                      }}
                    >
                      <Utensils size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "0.875rem" }}>{item.nama}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        {formatRupiah(item.harga)}
                      </div>
                    </div>
                  </div>

                  <div className="qty-control" style={{ width: "90px" }}>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => onRemoveFromCart(item.id)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-val">{item.qty}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => onAddToCart(item.id)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "4px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              {isDelivery && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "4px" }}>
                  <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Truck size={14} /> Biaya Pengantaran
                  </span>
                  <span>{formatRupiah(ONGKIR_FLAT)}</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1.0625rem",
                  fontWeight: "700",
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "1px dashed var(--border-default)",
                }}
              >
                <span>Total</span>
                <span style={{ color: "var(--accent-primary)" }}>{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="form-group">
              <label className="form-label">Nama Pemesan *</label>
              <input
                className="form-input"
                type="text"
                placeholder="Contoh: Budi Santoso"
                maxLength={40}
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {currentUser?.role === "kantin" ? "Status / Peran Pemesan *" : "Kelas *"}
              </label>
              <input
                className="form-input"
                type="text"
                placeholder={currentUser?.role === "kantin" ? "Ibu Kantin" : "Contoh: XII RPL 1"}
                maxLength={20}
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                required
              />
            </div>

            {/* Delivery option */}
            <div className="form-group">
              <label className="form-label">Opsi Pengambilan</label>
              <div className="radio-group">
                <div
                  className={`radio-card ${!isDelivery ? "active" : ""}`}
                  onClick={() => setIsDelivery(false)}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <UserCheck size={16} /> Diambil Sendiri
                </div>
                <div
                  className={`radio-card ${isDelivery ? "active" : ""}`}
                  onClick={() => setIsDelivery(true)}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Truck size={16} /> Diantar ke Kelas (+{formatRupiah(ONGKIR_FLAT)})
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="form-group">
              <label className="form-label">Metode Pembayaran</label>
              <div className="radio-group">
                <div
                  className={`radio-card ${payMethod === "tunai" ? "active" : ""}`}
                  onClick={() => setPayMethod("tunai")}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Banknote size={16} /> Tunai
                </div>
                <div
                  className={`radio-card ${payMethod === "qr" ? "active" : ""}`}
                  onClick={() => setPayMethod("qr")}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <QrCode size={16} /> QR Code / QRIS
                </div>
              </div>
            </div>

            {/* QR Preview if QR is chosen */}
            {payMethod === "qr" && (
              <div
                style={{
                  textAlign: "center",
                  padding: "14px",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "16px",
                  border: "1px dashed var(--border-default)",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.8125rem", marginBottom: "8px" }}>
                  QRIS • {kantin?.nama}
                </div>
                <DummyQR seed={`${kantin?.id}-${grandTotal}`} />
                <div style={{ fontWeight: 700, marginTop: "8px" }}>{formatRupiah(grandTotal)}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Scan QRIS untuk menyelesaikan pembayaran. Pesanan otomatis masuk status dimasak.
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Catatan Pesanan (opsional)</label>
              <input
                className="form-input"
                type="text"
                placeholder="Contoh: Jangan terlalu pedas, es dipisah"
                maxLength={60}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={isSubmitting}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {isSubmitting ? (
                "Mengirim Pesanan..."
              ) : payMethod === "qr" ? (
                <>
                  <QrCode size={18} /> Bayar QRIS ({formatRupiah(grandTotal)})
                </>
              ) : (
                <>
                  Pesan Sekarang ({formatRupiah(grandTotal)}) <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-block"
              style={{ marginTop: "8px" }}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Kembali
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
