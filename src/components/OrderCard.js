"use client";

import { formatRupiah, formatTime } from "@/lib/utils";
import {
  Clock,
  Flame,
  Truck,
  CheckCircle2,
  XCircle,
  UserCheck,
  Banknote,
  QrCode,
  Utensils,
} from "lucide-react";

export default function OrderCard({ order, kantinName = "Kantin" }) {
  const getCardStatus = () => {
    if (order.status === 0) {
      return { label: "Menunggu Konfirmasi", icon: Clock, color: "var(--color-warning)" };
    }
    if (order.status === 1) {
      return { label: "Sedang Dimasak", icon: Flame, color: "var(--color-primary)" };
    }
    if (order.status === 2) {
      return order.opsi_antar
        ? { label: "Makanan Sedang Diantar", icon: Truck, color: "var(--color-primary)" }
        : { label: "Makanan Siap Diambil", icon: UserCheck, color: "var(--color-primary)" };
    }
    if (order.status === 3) {
      return { label: "Pesanan Selesai", icon: CheckCircle2, color: "var(--color-success)" };
    }
    if (order.status === 4) {
      return { label: "Pesanan Dibatalkan", icon: XCircle, color: "var(--color-danger)" };
    }
    return { label: "Menunggu Konfirmasi", icon: Clock, color: "var(--color-warning)" };
  };

  const statusInfo = getCardStatus();
  const StatusIcon = statusInfo.icon;
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
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
          <b>{order.nama_pemesan}</b> {order.kelas ? `(${order.kelas})` : ""}
          <span>•</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            {order.opsi_antar ? (
              <>
                <Truck size={13} /> Diantar ke kelas
              </>
            ) : (
              <>
                <UserCheck size={13} /> Diambil sendiri
              </>
            )}
          </span>
          <span>•</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            {order.metode_bayar === "qr" ? (
              <>
                <QrCode size={13} /> QRIS (Lunas)
              </>
            ) : (
              <>
                <Banknote size={13} /> Tunai
              </>
            )}
          </span>
        </div>
        {order.catatan && (
          <div style={{ marginTop: "4px", color: "var(--text-tertiary)" }}>
            Catatan: &ldquo;{order.catatan}&rdquo;
          </div>
        )}
      </div>

      <div className="order-items-list" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
        <Utensils size={13} style={{ marginRight: "2px" }} />
        {order.items?.map((it, idx) => (
          <span key={idx}>
            {it.nama} ×{it.jumlah}
            {idx < order.items.length - 1 ? ", " : ""}
          </span>
        ))}
        {order.ongkir > 0 && (
          <span style={{ color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "2px" }}>
            {" "}• Ongkir {formatRupiah(order.ongkir)}
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
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: statusInfo.color,
              }}
            >
              <StatusIcon size={16} />
              {statusInfo.label}
            </span>
            <span style={{ fontSize: "1rem", fontWeight: "700" }}>
              {formatRupiah(order.total)}
            </span>
          </div>
        </>
      ) : (
        <div className="order-footer" style={{ color: "var(--color-danger)" }}>
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: "600",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <XCircle size={16} />
            Pesanan Dibatalkan
          </span>
          <span style={{ fontSize: "1rem", fontWeight: "700" }}>
            {formatRupiah(order.total)}
          </span>
        </div>
      )}
    </div>
  );
}
