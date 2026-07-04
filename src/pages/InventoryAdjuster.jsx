import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";

export default function InventoryAdjuster() {
  const [items, setItems] = useState([]);
  const [barcode, setBarcode] = useState("");
  const [mode, setMode] = useState("add"); // add | remove

  const inputRef = useRef(null);
  const scanTimeout = useRef(null);

  // ---------------- AUTO FOCUS ----------------
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const refocus = () => {
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // ---------------- LOAD INVENTORY ----------------
  const loadItems = async () => {
    const { data } = await supabase.from("inventory").select("*");
    if (data) setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  // ---------------- FIND ITEM BY BARCODE ----------------
  const processBarcode = async (value) => {
    if (!value) return;

    const match = items.find(
      (i) => String(i.barcode) === String(value)
    );

    if (!match) return;

    let newQty = match.quantity;

    if (mode === "add") {
      newQty = match.quantity + 1;
    } else {
      newQty = Math.max(0, match.quantity - 1);
    }

    const { error } = await supabase
      .from("inventory")
      .update({ quantity: newQty })
      .eq("id", match.id);

    if (!error) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === match.id ? { ...i, quantity: newQty } : i
        )
      );
    }

    setBarcode("");
    refocus();
  };

  // ---------------- SCAN HANDLER ----------------
  const handleScan = (value) => {
    setBarcode(value);

    if (scanTimeout.current) clearTimeout(scanTimeout.current);

    scanTimeout.current = setTimeout(() => {
      processBarcode(value);
    }, 120);
  };

  // ---------------- TOP BAR ----------------
  const TopBar = () => (
    <div className="bg-white p-3 rounded-xl shadow flex justify-between">
      <div className="font-bold">Inventory Adjuster</div>

      <div className="flex gap-2">

        <button
          onClick={() => setMode("add")}
          className={`px-4 py-2 rounded ${
            mode === "add"
              ? "bg-green-500 text-white"
              : "bg-gray-200"
          }`}
        >
          ADD
        </button>

        <button
          onClick={() => setMode("remove")}
          className={`px-4 py-2 rounded ${
            mode === "remove"
              ? "bg-red-500 text-white"
              : "bg-gray-200"
          }`}
        >
          REMOVE
        </button>

      </div>
    </div>
  );

  // ---------------- INVENTORY LIST ----------------
  const InventoryList = () => (
    <div className="bg-white p-3 rounded-xl shadow mt-4">

      <h2 className="font-bold mb-2">Live Stock</h2>

      <div className="space-y-2 max-h-[400px] overflow-auto">

        {items.map((i) => (
          <div
            key={i.id}
            className="flex justify-between border p-2 rounded"
          >
            <div>
              <div className="font-bold">{i.name}</div>
              <div className="text-sm text-gray-500">
                Barcode: {i.barcode}
              </div>
            </div>

            <div className="font-bold">
              {i.quantity}
            </div>
          </div>
        ))}

      </div>

    </div>
  );

  // ---------------- MAIN ----------------
  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-3">

      <TopBar />

      <div className="bg-white p-3 rounded-xl shadow">

        <input
          ref={inputRef}
          className="border p-3 rounded w-full"
          placeholder="Scan barcode..."
          value={barcode}
          onChange={(e) => handleScan(e.target.value)}
        />

      </div>

      <InventoryList />

    </div>
  );
}