import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../supabase";
import { Html5Qrcode } from "html5-qrcode";
import LabelPrint from "../components/LabelPrint";
import ReactDOMServer from "react-dom/server";
import Navbar from "../components/Navbar";
import beepSound from "../assets/beep.mp3";


export default function InventoryTracker() {
  const [items, setItems] = useState([]);

  const [barcode, setBarcode] = useState("");
  const [mode, setMode] = useState("remove");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  

  const scanTimeout = useRef(null);

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

   const audio = new Audio(beepSound);
    audio.volume = 0.6;
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

  const generateBarcode = () =>
    Date.now().toString().slice(-8);

  // ---------------- ADD ITEM ----------------
  const addItem = async () => {
    const barcodeValue = form.barcode || generateBarcode();

    await supabase.from("inventory").insert([
      {
        ...form,
        barcode: Number(barcodeValue),
        price: Number(form.price || 0),
        retail_cost: Number(form.retail_cost || 0),
        quantity: Number(form.quantity || 0),
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

  const addAndPrint = async () => {
    const barcodeValue = form.barcode || generateBarcode();

    const newItem = {
      ...form,
      barcode: Number(barcodeValue),
      price: Number(form.price || 0),
      retail_cost: Number(form.retail_cost || 0),
      quantity: Number(form.quantity || 0),
    };

    const { error } = await supabase
      .from("inventory")
      .insert([newItem]);

    if (!error) {
      printLabel(newItem);
      loadItems();
    }
  };

 const printLabel = (item) => {
  const win = window.open("", "_blank", "width=400,height=200");

  const html = ReactDOMServer.renderToString(
    <div id="print-root">
      <LabelPrint item={item} />
    </div>
  );

  win.document.open();
  win.document.write(`
    <html>
      <head>
        <title>Print Label</title>

        <style>
          @page {
            size: 50mm 25mm;
            margin: 0;
          }

          body {
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        </style>

      </head>

      <body>
        <div id="root">${html}</div>
      </body>
    </html>
  `);

  win.document.close();

  win.onload = () => {
    win.focus();
    win.print();
    win.close();
  };
};

  // ---------------- PROCESS BARCODE ----------------
  const processBarcode = async (scannedValue = barcode) => {
    if (!scannedValue) return;

    const { data } = await supabase
      .from("inventory")
      .select("*")
      .eq("barcode", Number(scannedValue))
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
          processBarcode(decodedText);

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

      <div className="flex gap-2">

 

  <button
    onClick={() => window.location.href = "/barcodes"}
    className="bg-gray-800 text-white px-4 py-2 rounded-xl"
  >
    View Barcodes
  </button>

</div>

      {/* SCANNER */}
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">

        <div className="flex gap-2">
          <input
            className="border rounded-xl p-3 flex-1"
            value={barcode}
            onChange={(e) => handleScanChange(e.target.value)}
            placeholder="Scan barcode (auto detects)"
          />

          <button
            onClick={startScanner}
            className="bg-blue-600 text-white px-5 rounded-xl"
          >
            Camera
          </button>
        </div>

        {/* ADD PRODUCT (RESTORED) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">

          <input
            className="border rounded-xl p-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            className="border rounded-xl p-2"
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          />

          <input
            className="border rounded-xl p-2"
            placeholder="Price"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />

          <input
            className="border rounded-xl p-2"
            placeholder="Retail"
            value={form.retail_cost}
            onChange={(e) =>
              setForm({
                ...form,
                retail_cost: e.target.value,
              })
            }
          />

          <input
            className="border rounded-xl p-2"
            placeholder="Qty"
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: e.target.value })
            }
          />

          <input
            className="border rounded-xl p-2"
            placeholder="Location"
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
          />

        </div>

        <div className="flex gap-3 mt-3">

          <button
            onClick={addItem}
            className="bg-black text-white px-5 py-3 rounded-xl"
          >
            Add Product
          </button>

          <button
            onClick={addAndPrint}
            className="bg-green-600 text-white px-5 py-3 rounded-xl"
          >
            Add & Print Label
          </button>

        </div>

        {/* MODE */}
        <div className="flex gap-2 mt-3">

          <button
            onClick={() => setMode("add")}
            className={`px-4 py-2 rounded-xl ${
              mode === "add"
                ? "bg-green-500 text-white"
                : "bg-white"
            }`}
          >
            ADD
          </button>

          <button
            onClick={() => setMode("remove")}
            className={`px-4 py-2 rounded-xl ${
              mode === "remove"
                ? "bg-red-500 text-white"
                : "bg-white"
            }`}
          >
            REMOVE
          </button>

        </div>

      </div>

      {/* GROUPED LIST */}
      {Object.entries(grouped).map(([cat, list]) => (
        <div key={cat} className="bg-white rounded-2xl shadow mb-4 overflow-hidden">

          <div className="p-4 font-bold bg-gray-50 border-b">
            {cat}
          </div>

          <table className="w-full text-sm">

            <thead>
              <tr className="text-left border-b bg-gray-100">
                <th className="p-3">Name</th>
                <th>Barcode</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Retail</th>
                <th>Profit</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {list.map((i) => (
                <tr key={i.id} className="border-b hover:bg-gray-50">

                  <td className="p-3">{i.name}</td>
                  <td>{i.barcode}</td>
                  <td>{i.quantity}</td>

                  <td>£{Number(i.price).toFixed(2)}</td>
                  <td>£{Number(i.retail_cost).toFixed(2)}</td>

                  <td className="font-semibold">
                    £{(
                      Number(i.retail_cost) - Number(i.price)
                    ).toFixed(2)}
                  </td>

                  <td>{i.location}</td>

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

    </div>
  );
}