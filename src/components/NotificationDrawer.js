"use client";

import { Bell, X, CheckCheck, Trash2, XCircle, Truck, UserCheck, ChevronRight } from "lucide-react";
import { formatTime } from "@/lib/utils";

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  onClearAll,
  onSelectNotification,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-box notif-drawer-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "460px",
          width: "100%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: "1px solid var(--border-default)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: "var(--accent-primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-primary)",
              }}
            >
              <Bell size={20} />
            </div>
            <div>
              <h3 className="modal-title" style={{ margin: 0, fontSize: "1.0625rem" }}>
                Pusat Pemberitahuan
              </h3>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Notifikasi pesanan siap & penolakan
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        {notifications.length > 0 && (
          <div
            style={{
              padding: "10px 16px",
              background: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border-default)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.75rem",
            }}
          >
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
              {notifications.length} Pemberitahuan
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onMarkAllRead}
                style={{
                  fontSize: "0.6875rem",
                  padding: "4px 8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <CheckCheck size={13} /> Tandai Dibaca
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onClearAll}
                style={{
                  fontSize: "0.6875rem",
                  padding: "4px 8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "var(--color-danger)",
                }}
              >
                <Trash2 size={13} /> Hapus
              </button>
            </div>
          </div>
        )}

        {/* List of Notifications */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {notifications.length === 0 ? (
            <div
              style={{
                padding: "48px 16px",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "var(--bg-tertiary)",
                  margin: "0 auto 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-tertiary)",
                }}
              >
                <Bell size={26} />
              </div>
              <h4 style={{ margin: "0 0 4px", fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                Belum Ada Pemberitahuan
              </h4>
              <p style={{ margin: 0, fontSize: "0.8125rem" }}>
                Ketika pesananmu hampir selesai atau ditolak oleh kantin, pemberitahuan akan muncul di sini.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const isRejected = item.status === 4;
              const isReady = item.status === 2;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectNotification) onSelectNotification(item);
                    onClose();
                  }}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: item.read ? "var(--bg-primary)" : "var(--bg-secondary)",
                    border: item.read
                      ? "1px solid var(--border-default)"
                      : isRejected
                      ? "1px solid #FECACA"
                      : "1px solid #BFDBFE",
                    boxShadow: item.read ? "none" : "var(--shadow-sm)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    position: "relative",
                  }}
                >
                  {/* Unread indicator dot */}
                  {!item.read && (
                    <span
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: isRejected ? "var(--color-danger)" : "var(--accent-primary)",
                      }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: isRejected
                        ? "var(--color-danger-light)"
                        : "var(--accent-primary-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isRejected ? (
                      <XCircle size={20} color="var(--color-danger)" />
                    ) : item.opsi_antar ? (
                      <Truck size={20} color="var(--color-primary)" />
                    ) : (
                      <UserCheck size={20} color="var(--color-primary)" />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0, paddingRight: "12px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "2px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: item.read ? "600" : "700",
                          color: isRejected
                            ? "var(--color-danger)"
                            : isReady
                            ? "var(--accent-primary)"
                            : "var(--text-primary)",
                        }}
                      >
                        {item.title}
                      </span>
                      <span style={{ fontSize: "0.6875rem", color: "var(--text-tertiary)" }}>
                        • {formatTime(item.createdAt)}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: "0 0 4px",
                        fontSize: "0.8125rem",
                        color: "var(--text-secondary)",
                        lineHeight: 1.4,
                      }}
                    >
                      {item.message}
                    </p>

                    {item.reason && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-danger)",
                          backgroundColor: "var(--color-danger-light)",
                          padding: "4px 8px",
                          borderRadius: "var(--radius-sm)",
                          marginTop: "4px",
                          display: "inline-block",
                        }}
                      >
                        <strong>Alasan:</strong> {item.reason}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "6px",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: "var(--accent-primary)",
                      }}
                    >
                      <span>Lihat rincian pesanan</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
