import React from "react";
import ProductCard from "./ProductCard";

export default function CategoryView({
  items,
  activeCategory,
  setView,
  addToBasket,
  overrideStock
}) {
  const filtered = items.filter(
    (i) => (i.category || "Other") === activeCategory
  );

  return (
    <div className="mt-4">

      {/* RETURN BUTTON */}
      <div className="flex mb-3">
        <button
          onClick={() => setView("categories")}
          className="bg-gray-800 text-white px-4 py-2 rounded-xl"
        >
          ← Return
        </button>
      </div>

      {/* PRODUCTS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            onAdd={addToBasket}
            disabled={item.quantity === 0 && !overrideStock}
          />
        ))}
      </div>
    </div>
  );
}