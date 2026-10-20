"use client";

import { formatRupiah, formatTime, ORDER_STATUS } from "@/lib/utils";

export default function OrderCard({ order, kantinName = "Kantin" }) {
  const statusInfo = ORDER_STATUS[order.status] || ORDER_STATUS[0];
  const isCancelled = order.status === 4;

  return (
    <div className={`order-card status-${order.status}`}>
      <div className="order-header">
        <span className="order-id">
          #{order.id} • {kantinName}
        </span>
        <span className="order-time">
          {formatTime(order.created_at)}
        </span>
      </div>

      <div className="order-meta">
        <div>
          <b>{order.nama_pemesan}</b> ({order.kelas}) •{" "}
          {order.opsi_antar ? "🛵 Diantar ke kelas" : "🚶 Diambil sendiri"} •{" "}
          {order.metode_bayar === "qr" ? "📱 QR Code" : "💵 Tunai"}
        </div>
        {order.catatan && (
          <div style={{ marginTop: "4px", color: "var(--text-tertiary)" }}>
            Catatan: &ldquo;{order.catatan}&rdquo;
          </div>
        )}
      </div>

      <div className="order-items-list">
        {order.items?.map((it, idx) => (
          <span key={idx}>
            {it.emoji || "🍽️"} {it.nama} ×{it.jumlah}
            {idx < order.items.length - 1 ? ", " : ""}
          </span>
        ))}
        {order.ongkir > 0 && (
          <span style={{ color: "var(--text-secondary)" }}>
            {" "}• 🛵 Ongkir {formatRupiah(order.ongkir)}
          </span>
        )}
      </div>

      {/* 4-Step Progress Bar */}
      {!isCancelled ? (
        <>
          <div className="order-progress-bar">
            {[0, 1, 2, 3].map((step) => {
              const isDone = order.status >= step;
              return (
                <div
                  key={step}
                  className={`order-progress-step ${isDone ? "done" : ""}`}
                />
              );
            })}
          </div>
          <div className="order-footer">
            <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>
              {statusInfo.label}
            </span>
            <span style={{ fontSize: "1rem", fontWeight: "700" }}>
              {formatRupiah(order.total)}
            </span>
          </div>
        </>
      ) : (
        <div className="order-footer" style={{ color: "var(--color-danger)" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>
            Pesanan Dibatalkan ❌
          </span>
          <span style={{ fontSize: "1rem", fontWeight: "700" }}>
            {formatRupiah(order.total)}
          </span>
        </div>
      )}
    </div>
  );
}
