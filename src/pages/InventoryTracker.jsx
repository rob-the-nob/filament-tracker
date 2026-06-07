import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import { Html5Qrcode } from "html5-qrcode";

export default function InventoryTracker() {
  const [items, setItems] = useState([]);

  const [barcode, setBarcode] = useState("");
  const [mode, setMode] = useState("remove");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    name: "",
    barcode: "",
    category: "",
    price: "",
    retail_cost: "",
    quantity: "",
    location: "",
    notes: "",
  });

  // ---------------- DROPDOWNS ----------------
  const categories = [
    "Electronics",
    "Tools",
    "3D Printing",
    "Packaging",
    "Office",
    "Raw Materials",
    "Other",
  ];

  const locations = [
    "Main Store",
    "Warehouse",
    "Shelf A",
    "Shelf B",
    "Drawer 1",
    "Drawer 2",
    "Workshop",
  ];

  // ---------------- Barcode Genneration ----------------
  const generateBarcode = () => {
    const time = Date.now().toString(); // unique base
    const random = Math.floor(100 + Math.random() * 900); // 3-digit safety

    return Number(time.slice(-6) + random); // keep it numeric + short-ish
  };

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

  // ---------------- FEEDBACK ----------------
  const feedback = () => {
    if (navigator.vibrate) navigator.vibrate(120);

    const audio = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
    );
    audio.play();
  };

  // ---------------- GROUP ----------------
  const grouped = useMemo(() => {
    const g = {};

    items.forEach((i) => {
      const cat = i.category || "Uncategorised";
      if (!g[cat]) g[cat] = [];
      g[cat].push(i);
    });

    return g;
  }, [items]);

  // ---------------- ADD ITEM ----------------
  const addItem = async () => {
    await supabase.from("inventory").insert([
      {
        ...form,
        barcode: Number(form.barcode),
        price: Number(form.price),
        retail_cost: Number(form.retail_cost),
        quantity: Number(form.quantity),
      },
    ]);

    setForm({
      name: "",
      barcode: "",
      category: "",
      price: "",
      retail_cost: "",
      quantity: "",
      location: "",
      notes: "",
    });

    loadItems();
  };

  // ---------------- SCAN UPDATE ----------------
  const processBarcode = async () => {
    if (!barcode) return;

    const { data } = await supabase
      .from("inventory")
      .select("*")
      .eq("barcode", Number(barcode))
      .single();

    if (!data) return;

    const updatedQty =
      mode === "add"
        ? data.quantity + 1
        : Math.max(0, data.quantity - 1);

    await supabase
      .from("inventory")
      .update({ quantity: updatedQty })
      .eq("id", data.id);

    feedback();
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
        ...editing,
        barcode: Number(editing.barcode),
        price: Number(editing.price),
        retail_cost: Number(editing.retail_cost),
        quantity: Number(editing.quantity),
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
          feedback();

          scanner.stop().then(() => {
            scanner.clear();
            setScannerOpen(false);
          });
        }
      );
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-3xl font-bold">Inventory Tracker</h1>
      </div>

      {/* ADD FORM */}
      <div className="bg-white rounded-2xl shadow p-6 grid grid-cols-3 gap-3">

        <input className="border rounded-xl p-3"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input className="border rounded-xl p-3"
          placeholder="Barcode"
          value={form.barcode}
          onChange={(e) => setForm({ ...form, barcode: e.target.value })}
        />

        {/* CATEGORY DROPDOWN */}
        <select
          className="border rounded-xl p-3"
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input className="border rounded-xl p-3"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input className="border rounded-xl p-3"
          placeholder="Retail Cost"
          value={form.retail_cost}
          onChange={(e) =>
            setForm({ ...form, retail_cost: e.target.value })
          }
        />

        <input className="border rounded-xl p-3"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.value })
          }
        />

        {/* LOCATION DROPDOWN */}
        <select
          className="border rounded-xl p-3"
          value={form.location}
          onChange={(e) =>
            setForm({ ...form, location: e.target.value })
          }
        >
          <option value="">Select Location</option>
          {locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <input className="border rounded-xl p-3 col-span-2"
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <button
          onClick={addItem}
          className="bg-black text-white rounded-xl"
        >
          Add Item
        </button>
      </div>

      {/* SCANNER */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-3">

        <div className="flex rounded-xl overflow-hidden w-fit">
          <button
            onClick={() => setMode("add")}
            className={`px-5 py-2 ${
              mode === "add"
                ? "bg-green-500 text-white"
                : "bg-white"
            }`}
          >
            ADD
          </button>

          <button
            onClick={() => setMode("remove")}
            className={`px-5 py-2 ${
              mode === "remove"
                ? "bg-red-500 text-white"
                : "bg-white"
            }`}
          >
            REMOVE
          </button>
        </div>

        <div className="flex gap-2">
          <input
            className="border rounded-xl p-3 flex-1"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scan barcode"
          />

          <button
            onClick={startScanner}
            className="bg-blue-600 text-white px-5 rounded-xl"
          >
            Camera
          </button>
        </div>

        <button
          onClick={processBarcode}
          className="bg-black text-white px-6 py-2 rounded-xl"
        >
          Confirm
        </button>
      </div>

      {/* GROUPED TABLE */}
      {Object.entries(grouped).map(([cat, list]) => (
        <div key={cat} className="bg-white rounded-2xl shadow">

          <div className="p-4 font-bold bg-gray-50">
            {cat}
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
                <tr key={i.id} className="border-t">

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
                      className="bg-yellow-400 px-3 rounded-xl"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteItem(i.id)}
                      className="bg-red-500 text-white px-3 rounded-xl"
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-[500px] space-y-2">

            <h2 className="font-bold text-xl">Edit</h2>

            {Object.keys(editing).map((k) =>
              k !== "id" ? (
                <input
                  key={k}
                  className="border p-2 rounded-xl w-full"
                  value={editing[k] ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      [k]: e.target.value,
                    })
                  }
                />
              ) : null
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)}>Cancel</button>
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

      {/* SCANNER MODAL */}
      {scannerOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-white p-4 rounded-2xl w-[90%] max-w-md">

            <div id="reader" />

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