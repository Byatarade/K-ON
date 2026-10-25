"use client";

import { PackageOpen } from "lucide-react";

export default function EmptyState({ icon: Icon, title, subtitle, actionText, onAction }) {
  return (
    <div className="empty-state">
      <div
        className="empty-icon"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-tertiary)",
          marginBottom: "12px",
        }}
      >
        {Icon ? (
          typeof Icon === "function" || typeof Icon === "object" ? (
            <Icon size={44} strokeWidth={1.5} />
          ) : (
            Icon
          )
        ) : (
          <PackageOpen size={44} strokeWidth={1.5} />
        )}
      </div>
      {title && <h3 className="empty-title">{title}</h3>}
      {subtitle && <p className="empty-subtitle">{subtitle}</p>}
      {actionText && onAction && (
        <button
          className="btn btn-secondary btn-sm"
          style={{ marginTop: "16px" }}
          onClick={onAction}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
