import React, { useState } from "react";
import { supabase } from "../supabase";

export default function Checkout({
  basket,
  total,
  setBasket,
  loadItems,
  overrideStock,
  session
}) {
  const [paymentMode, setPaymentMode] = useState("card");
  const [cashGiven, setCashGiven] = useState("");

  // ---------------- CHECKOUT ----------------
  const checkout = async () => {
    if (!basket || basket.length === 0) return;

    if (!session) {
      alert("No active session");
      return;
    }

    // 1. CREATE SALE
    const sale = {
      total,
      payment: paymentMode,
      cash_given:
        paymentMode === "cash"
          ? Number(cashGiven || 0)
          : null,
      session_id: session.id,
      created_at: new Date(),
    };

    const { data: saleData, error } = await supabase
      .from("sales")
      .insert([sale])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    // 2. INSERT SALE ITEMS + UPDATE STOCK
    for (const item of basket) {
      await supabase.from("sale_items").insert([
        {
          sale_id: saleData.id,
          inventory_id: item.id,
          name: item.name,
          qty: item.qty,
          price: item.retail_cost,
        },
      ]);

      const newStock = item.quantity - item.qty;

      // stock rule
      if (newStock >= 0 || overrideStock) {
        await supabase
          .from("inventory")
          .update({
            quantity: overrideStock
              ? item.quantity
              : newStock,
          })
          .eq("id", item.id);
      }
    }

    // 3. RESET UI
    setBasket([]);
    setCashGiven("");
    loadItems();

    alert("Sale Complete");
  };

  // ---------------- UI ----------------
  return (
    <div className="bg-white p-4 rounded-xl shadow mt-4">

      {/* PAYMENT MODE */}
      <div className="flex gap-2 mb-2">

        <button
          onClick={() => setPaymentMode("cash")}
          className={`px-3 py-2 rounded ${
            paymentMode === "cash"
              ? "bg-green-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Cash
        </button>

        <button
          onClick={() => setPaymentMode("card")}
          className={`px-3 py-2 rounded ${
            paymentMode === "card"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Card
        </button>

      </div>

      {/* CASH INPUT */}
      {paymentMode === "cash" && (
        <input
          className="border p-2 w-full rounded mb-2"
          placeholder="Cash given"
          value={cashGiven}
          onChange={(e) => setCashGiven(e.target.value)}
        />
      )}

      {/* TOTAL */}
      <div className="font-bold mb-2">
        Total: £{total.toFixed(2)}
      </div>

      {/* CHECKOUT BUTTON */}
      <button
        onClick={checkout}
        className="bg-black text-white w-full p-3 rounded-xl"
      >
        Complete Sale
      </button>

    </div>
  );
}