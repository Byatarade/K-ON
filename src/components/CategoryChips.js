"use client";

import { LayoutGrid, Utensils, Coffee, Cookie } from "lucide-react";

const CATEGORIES = [
  { id: "Semua", label: "Semua", icon: LayoutGrid },
  { id: "Makanan", label: "Makanan", icon: Utensils },
  { id: "Minuman", label: "Minuman", icon: Coffee },
  { id: "Snack", label: "Snack", icon: Cookie },
];

export default function CategoryChips({ activeCategory = "Semua", onSelectCategory }) {
  return (
    <div className="chips-container" role="tablist">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        const Icon = cat.icon;
        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            className={`chip ${isActive ? "active" : ""}`}
            onClick={() => onSelectCategory(cat.id)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Icon size={14} />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
