"use client";

const CATEGORIES = [
  { id: "Semua", label: "Semua", icon: "🌟" },
  { id: "Makanan", label: "Makanan", icon: "🍱" },
  { id: "Minuman", label: "Minuman", icon: "🥤" },
  { id: "Snack", label: "Snack", icon: "🍿" },
];

export default function CategoryChips({ activeCategory = "Semua", onSelectCategory }) {
  return (
    <div className="chips-container" role="tablist">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            className={`chip ${isActive ? "active" : ""}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
