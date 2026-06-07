import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import { Html5Qrcode } from "html5-qrcode";

export default function InventoryTracker() {
  const [items, setItems] = useState([]);

  const [barcode, setBarcode] = useState("");
  const [mode, setMode] = useState("remove");

  const [scannerOpen, setScannerOpen] = useState(false);

  const [editing, setEditing] = useState(null);

  // ---------------- LOAD ----------------
  const loadItems = async () => {
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("category", { ascending: true });

    if (!error && data) setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  // ---------------- GROUP ----------------
  const grouped = useMemo(() => {
    const groups = {};

    items.forEach((item) => {
      const cat = item.category || "Uncategorised";

      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    return groups;
  }, [items]);

  // ---------------- BARCODE ACTION ----------------
  const processBarcode = async () => {
    if (!barcode) return;

    const { data } = await supabase
      .from("inventory")
      .select("*")
      .eq("barcode", Number(barcode))
      .single();

    if (!data) return;

    const newQty =
      mode === "add"
        ? data.quantity + 1
        : Math.max(0, data.quantity - 1);

    await supabase
      .from("inventory")
      .update({ quantity: newQty })
      .eq("id", data.id);

    setBarcode("");
    loadItems();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") processBarcode();
  };

  // ---------------- DELETE ----------------
  const deleteItem = async (id) => {
    await supabase.from("inventory").delete().eq("id", id);
    loadItems();
  };

  // ---------------- EDIT ----------------
  const saveEdit = async () => {
    await supabase
      .from("inventory")
      .update({
        name: editing.name,
        barcode: Number(editing.barcode),
        category: editing.category,
        price: Number(editing.price),
        retail_cost: Number(editing.retail_cost),
        quantity: Number(editing.quantity),
        location: editing.location,
        notes: editing.notes,
      })
      .eq("id", editing.id);

    setEditing(null);
    loadItems();
  };

  // ---------------- CAMERA ----------------
  const startScanner = () => {
    setScannerOpen(true);

    setTimeout(() => {
      const scanner = new Html5Qrcode("reader");

      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          setBarcode(decodedText);

          scanner.stop().then(() => {
            scanner.clear();
            setScannerOpen(false);
          });
        }
      );
    }, 300);
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-3xl font-bold">Inventory Tracker</h1>
      </div>

      {/* CONTROL BAR */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">

        {/* MODE */}
        <div className="flex rounded-xl overflow-hidden w-fit shadow">
          <button
            onClick={() => setMode("add")}
            className={`px-6 py-2 ${
              mode === "add"
                ? "bg-green-500 text-white"
                : "bg-white"
            }`}
          >
            ADD
          </button>

          <button
            onClick={() => setMode("remove")}
            className={`px-6 py-2 ${
              mode === "remove"
                ? "bg-red-500 text-white"
                : "bg-white"
            }`}
          >
            REMOVE
          </button>
        </div>

        {/* BARCODE */}
        <div className="flex gap-2">
          <input
            className="border rounded-xl p-3 flex-1"
            placeholder="Scan or enter barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            onClick={startScanner}
            className="bg-blue-600 text-white px-5 rounded-xl"
          >
            📷 Camera
          </button>
        </div>

        <button
          onClick={processBarcode}
          className="bg-black text-white px-6 py-2 rounded-xl"
        >
          Confirm
        </button>
      </div>

      {/* GROUPED TABLES */}
      {Object.entries(grouped).map(([category, list]) => (
        <div
          key={category}
          className="bg-white rounded-2xl shadow overflow-hidden"
        >

          <div className="p-4 bg-gray-50 font-bold text-lg">
            {category}
          </div>

          <table className="w-full text-sm">

            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Name</th>
                <th>Barcode</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Retail</th>
                <th>Location</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {list.map((i) => (
                <tr key={i.id} className="border-t hover:bg-gray-50">

                  <td className="p-3">{i.name}</td>
                  <td>{i.barcode}</td>
                  <td>{i.quantity}</td>
                  <td>£{i.price}</td>
                  <td>£{i.retail_cost}</td>
                  <td>{i.location}</td>
                  <td>{i.notes}</td>

                  <td className="flex gap-2 p-2">

                    <button
                      onClick={() => setEditing(i)}
                      className="bg-yellow-400 px-3 py-1 rounded-xl"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteItem(i.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-xl"
                    >
                      Delete
                    </button>

                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      ))}

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-2xl w-[500px] space-y-2">

            <h2 className="text-xl font-bold">Edit Item</h2>

            {Object.keys(editing).map((key) =>
              key !== "id" ? (
                <input
                  key={key}
                  className="border p-2 rounded-xl w-full"
                  value={editing[key] ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, [key]: e.target.value })
                  }
                  placeholder={key}
                />
              ) : null
            )}

            <div className="flex justify-end gap-2 pt-2">

              <button onClick={() => setEditing(null)}>
                Cancel
              </button>

              <button
                onClick={saveEdit}
                className="bg-black text-white px-4 py-2 rounded-xl"
              >
                Save
              </button>

            </div>

          </div>
        </div>
      )}

      {/* CAMERA */}
      {scannerOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-white p-4 rounded-2xl w-[90%] max-w-md">

            <h2 className="text-xl font-bold mb-2">Scan Barcode</h2>

            <div id="reader" className="w-full"></div>

            <button
              onClick={() => setScannerOpen(false)}
              className="mt-3 bg-red-500 text-white px-4 py-2 rounded-xl"
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  );
}