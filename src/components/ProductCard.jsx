import React, { useState } from "react";
import { supabase } from "../supabase";

export default function ProductCard({ item, addToBasket }) {
  const [stock, setStock] = useState(item.quantity);

  // ---------------- ADD TO BASKET + REDUCE STOCK ----------------
  const handleAdd = async () => {
    if (stock <= 0) return;

    // 1. Add to basket (POS state)
    addToBasket(item);

    // 2. Reduce local UI stock instantly
    const newStock = stock - 1;
    setStock(newStock);

    // 3. Update Supabase stock
    const { error } = await supabase
      .from("inventory")
      .update({ quantity: newStock })
      .eq("id", item.id);

    if (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white p-3 rounded-xl shadow hover:bg-gray-100">

      {/* NAME */}
      <div className="font-bold text-lg">
        {item.name}
      </div>

      {/* PRICE */}
      <div className="text-sm text-gray-600">
        £{Number(item.retail_cost).toFixed(2)}
      </div>

      {/* STOCK DISPLAY */}
      <div className="mt-1 text-sm font-semibold">
        Stock: {stock}
      </div>

      {/* BUTTON */}
      <button
        onClick={handleAdd}
        disabled={stock <= 0}
        className={`mt-2 px-3 py-2 rounded w-full ${
          stock <= 0
            ? "bg-gray-400"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {stock <= 0 ? "Out of Stock" : "Add to Basket"}
      </button>

    </div>
  );
}