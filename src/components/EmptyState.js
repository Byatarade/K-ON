"use client";

export default function EmptyState({ icon = "📦", title, subtitle, actionText, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
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
