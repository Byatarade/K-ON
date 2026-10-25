"use client";

import { Utensils, ClipboardList } from "lucide-react";

export default function BottomNav({ activeTab = "jajan", onChangeTab, activeOrderCount = 0 }) {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <button
          className={`bottom-nav-item ${activeTab === "jajan" ? "active" : ""}`}
          onClick={() => onChangeTab("jajan")}
        >
          <Utensils size={20} />
          <span>Jajan</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === "pesanan" ? "active" : ""}`}
          onClick={() => onChangeTab("pesanan")}
          style={{ position: "relative" }}
        >
          <ClipboardList size={20} />
          <span>Pesanan Saya</span>
          {activeOrderCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "8px",
                right: "calc(50% - 24px)",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "var(--accent-primary)",
              }}
            />
          )}
        </button>
      </div>
    </nav>
  );
}
