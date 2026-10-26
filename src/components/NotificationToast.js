"use client";

import { useEffect, useState } from "react";
import { Bell, XCircle, Truck, UserCheck, X, ChevronRight } from "lucide-react";

export default function NotificationToast({ notification, onClose, onAction }) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      handleClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, [notification]);

  if (!notification) return null;

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
      setIsLeaving(false);
    }, 250);
  };

  const isReady = notification.status === 2;
  const isRejected = notification.status === 4;

  const getIcon = () => {
    if (isRejected) return <XCircle size={22} color="var(--color-danger)" />;
    if (notification.opsi_antar) return <Truck size={22} color="var(--color-primary)" />;
    return <UserCheck size={22} color="var(--color-primary)" />;
  };

  return (
    <div
      className={`notif-toast-container ${isLeaving ? "toast-exit" : "toast-enter"}`}
      role="alert"
      aria-live="assertive"
    >
      <div className={`notif-toast-card ${isRejected ? "toast-danger" : "toast-success"}`}>
        <div className="notif-toast-icon-wrap">{getIcon()}</div>

        <div className="notif-toast-body">
          <div className="notif-toast-header">
            <span className="notif-toast-title">
              {notification.title || (isReady ? "Pesanan Hampir Selesai!" : "Pesanan Ditolak")}
            </span>
            <span className="notif-toast-time">Baru saja</span>
          </div>

          <p className="notif-toast-message">{notification.message}</p>

          {notification.reason && (
            <div className="notif-toast-reason">
              <strong>Alasan:</strong> {notification.reason}
            </div>
          )}

          <div className="notif-toast-actions">
            {onAction && (
              <button
                type="button"
                className="btn btn-primary btn-sm notif-action-btn"
                onClick={() => {
                  onAction(notification);
                  handleClose();
                }}
              >
                <span>Lihat Pesanan</span>
                <ChevronRight size={14} />
              </button>
            )}
            <button
              type="button"
              className="notif-dismiss-btn"
              onClick={handleClose}
            >
              Tutup
            </button>
          </div>
        </div>

        <button
          type="button"
          className="notif-close-x"
          onClick={handleClose}
          aria-label="Tutup notifikasi"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
