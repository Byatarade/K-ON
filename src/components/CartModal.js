"use client";

import { useState } from "react";
import { formatRupiah, ONGKIR_FLAT } from "@/lib/utils";
import DummyQR from "@/components/DummyQR";

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
}) {
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [isDelivery, setIsDelivery] = useState(false);
  const [payMethod, setPayMethod] = useState("tunai"); // "tunai" | "qr"
  const [catatan, setCatatan] = useState("");

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
    if (!nama.trim() || !kelas.trim() || !jurusan.trim()) {
      alert("Harap isi nama lengkap, kelas, dan jurusan terlebih dahulu ya! 😊");
      return;
    }
    if (cartEntries.length === 0) {
      alert("Keranjang kamu masih kosong!");
      return;
    }

    const orderPayload = {
      kantin_id: kantin.id,
      nama_pemesan: nama.trim(),
      kelas: kelas.trim(),
      jurusan: jurusan.trim(),
      opsi_antar: isDelivery,
      // QRIS = dibayar langsung -> pesanan langsung dimasak (status 1)
      status: payMethod === "qr" ? 1 : 0,
      sudah_bayar: payMethod === "qr",
      metode_bayar: payMethod,
      catatan: catatan.trim(),
      ongkir,
      total: grandTotal,
      items: cartEntries.map((it) => ({
        menu_id: it.id,
        nama: it.nama,
        emoji: it.emoji || "🍽️",
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
          <div>
            <h3 className="modal-title">🛒 Keranjang Belanja</h3>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              {kantin?.nama || "Kantin"}
            </span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </div>

        {cartEntries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
              Keranjang masih kosong. Yuk pilih jajan dulu! 😋
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
                    <span style={{ fontSize: "1.5rem" }}>{item.emoji || "🍽️"}</span>
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
                    >
                      −
                    </button>
                    <span className="qty-val">{item.qty}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => onAddToCart(item.id)}
                    >
                      +
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
                  <span style={{ color: "var(--text-secondary)" }}>🛵 Biaya Pengantaran</span>
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
              <label className="form-label">Nama Lengkap *</label>
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

            <div style={{ display: "flex", gap: "10px" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Kelas *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Contoh: XI-2"
                  maxLength={12}
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Jurusan *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Contoh: RPL"
                  maxLength={20}
                  value={jurusan}
                  onChange={(e) => setJurusan(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Delivery option */}
            <div className="form-group">
              <label className="form-label">Opsi Pengambilan</label>
              <div className="radio-group">
                <div
                  className={`radio-card ${!isDelivery ? "active" : ""}`}
                  onClick={() => setIsDelivery(false)}
                >
                  🚶 Diambil Sendiri
                </div>
                <div
                  className={`radio-card ${isDelivery ? "active" : ""}`}
                  onClick={() => setIsDelivery(true)}
                >
                  🛵 Diantar ke Kelas (+{formatRupiah(ONGKIR_FLAT)})
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
                >
                  💵 Tunai
                </div>
                <div
                  className={`radio-card ${payMethod === "qr" ? "active" : ""}`}
                  onClick={() => setPayMethod("qr")}
                >
                  📱 QR Code / QRIS
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
                <div style={{ fontWeight: 700, fontSize: "0.8125rem", marginBottom: "8px" }}>QRIS • {kantin?.nama}</div>
                <DummyQR seed={`${kantin?.id}-${grandTotal}`} />
                <div style={{ fontWeight: 700, marginTop: "8px" }}>{formatRupiah(grandTotal)}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Kode QRIS simulasi. Klik tombol di bawah untuk menyelesaikan pembayaran, pesanan langsung dimasak.
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
            >
              {isSubmitting
                ? "Mengirim Pesanan..."
                : payMethod === "qr"
                ? `📱 Bayar dengan QRIS (${formatRupiah(grandTotal)})`
                : `🚀 Pesan Sekarang (${formatRupiah(grandTotal)})`}
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
