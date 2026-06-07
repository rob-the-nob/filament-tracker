import React, { useState } from "react";
import { supabase } from "../supabase";

export default function Scanner() {
  const [barcode, setBarcode] = useState("");
  const [mode, setMode] = useState("remove"); // add | remove
  const [status, setStatus] = useState("");

  const processScan = async () => {
    if (!barcode) return;

    setStatus("Searching...");

    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .eq("barcode", Number(barcode))
      .single();

    if (error || !data) {
      setStatus("Item not found in inventory");
      setBarcode("");
      return;
    }

    const newQty =
      mode === "add"
        ? data.quantity + 1
        : Math.max(0, data.quantity - 1);

    const { error: updateError } = await supabase
      .from("inventory")
      .update({ quantity: newQty })
      .eq("id", data.id);

    if (updateError) {
      setStatus("Update failed");
      return;
    }

    setStatus(
      `${data.name} ${mode === "add" ? "increased" : "decreased"}`
    );

    setBarcode("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      processScan();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">

      {/* HEADER */}
      <div className="bg-white p-5 rounded-2xl shadow w-full max-w-md text-center">
        <h1 className="text-2xl font-bold">Scanner</h1>
        <p className="text-sm text-gray-500">
          Inventory Barcode Scanner
        </p>
      </div>

      {/* MODE TOGGLE */}
      <div className="flex mt-5 rounded-2xl overflow-hidden shadow">

        <button
          onClick={() => setMode("add")}
          className={`px-6 py-3 font-bold ${
            mode === "add"
              ? "bg-green-500 text-white"
              : "bg-white"
          }`}
        >
          ADD
        </button>

        <button
          onClick={() => setMode("remove")}
          className={`px-6 py-3 font-bold ${
            mode === "remove"
              ? "bg-red-500 text-white"
              : "bg-white"
          }`}
        >
          REMOVE
        </button>

      </div>

      {/* SCAN INPUT */}
      <input
        className="mt-6 p-4 text-center text-xl border rounded-xl w-full max-w-md"
        placeholder="Scan barcode here"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />

      {/* STATUS */}
      <div className="mt-4 text-center font-semibold">
        {status}
      </div>

    </div>
  );
}