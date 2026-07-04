import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../supabase";

export default function POS() {
  const [items, setItems] = useState([]);
  const [basket, setBasket] = useState([]);

  const [category, setCategory] = useState(null);
  const [barcode, setBarcode] = useState("");

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState("");

  const scanTimeout = useRef(null);
  const barcodeRef = useRef(null);

  // ---------------- AUTO FOCUS BARCODE ----------------
  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const refocusBarcode = () => {
    setTimeout(() => barcodeRef.current?.focus(), 50);
  };

  // ---------------- LOAD ----------------
  const loadItems = async () => {
    const { data } = await supabase.from("inventory").select("*");
    if (data) setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  // ---------------- CATEGORIES ----------------
  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category || "Other"));
    return Array.from(set);
  }, [items]);

  const filteredItems =
    category === null
      ? []
      : items.filter((i) => i.category === category);

  // ---------------- CATEGORY COLOURS ----------------
  const categoryColors = {
    Bags: "bg-pink-500 text-white",
    Cards: "bg-blue-500 text-white",
    Christmas: "bg-red-500 text-white",
    Clothing: "bg-green-500 text-white",
    Cushions: "bg-yellow-500 text-black",
    "Drinkware/Bottles": "bg-purple-500 text-white",
    Ebroidery: "bg-indigo-500 text-white",
    Other: "bg-gray-500 text-white",
  };

  const getCatStyle = (cat) =>
    categoryColors[cat] || "bg-gray-400 text-white";

  // ---------------- BASKET ----------------
  const addToBasket = async (item) => {
    if (item.quantity <= 0) return alert("Out of stock");

    setBasket((prev) => {
      const exists = prev.find((b) => b.id === item.id);
      if (exists) {
        return prev.map((b) =>
          b.id === item.id ? { ...b, qty: b.qty + 1 } : b
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });

    const newStock = item.quantity - 1;

    await supabase
      .from("inventory")
      .update({ quantity: newStock })
      .eq("id", item.id);

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, quantity: newStock } : i
      )
    );
  };

  const removeOne = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setBasket((prev) =>
      prev
        .map((b) =>
          b.id === id ? { ...b, qty: b.qty - 1 } : b
        )
        .filter((b) => b.qty > 0)
    );

    const restored = item.quantity + 1;

    await supabase
      .from("inventory")
      .update({ quantity: restored })
      .eq("id", id);

    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: restored } : i
      )
    );
  };

  const total = basket.reduce(
    (s, i) => s + i.qty * Number(i.retail_cost),
    0
  );

  const clearBasket = () => setBasket([]);

  // ---------------- SCANNER ----------------
  const handleScan = (value) => {
    setBarcode(value);

    if (scanTimeout.current) clearTimeout(scanTimeout.current);

    scanTimeout.current = setTimeout(() => {
      const match = items.find(
        (i) => String(i.barcode) === String(value)
      );

      if (match) addToBasket(match);

      setBarcode("");
      refocusBarcode();
    }, 120);
  };

  // ---------------- TOP BAR ----------------
  const TopBar = () => (
    <div className="bg-white p-3 rounded-xl shadow flex justify-between">
      <div className="font-bold">POS</div>
      <div className="font-bold">£{total.toFixed(2)}</div>
    </div>
  );

  // ---------------- CATEGORY (CENTER BIG BUTTONS) ----------------
  const CategoryCenter = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`p-12 text-2xl font-bold rounded-2xl shadow hover:opacity-80 ${getCatStyle(
              c
            )}`}
          >
            {c}
          </button>
        ))}

      </div>
    </div>
  );

  // ---------------- ITEMS VIEW ----------------
  const ItemView = () => (
    <div className="flex-1 bg-white p-4 rounded-xl shadow relative">

      <button
        onClick={() => setCategory(null)}
        className="absolute top-3 left-3 bg-gray-800 text-white px-3 py-1 rounded"
      >
        ← Return
      </button>

      <h2 className="text-xl font-bold text-center mb-4">
        {category}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              addToBasket(item);
              refocusBarcode();
            }}
            className="bg-gray-100 p-3 rounded hover:bg-gray-200 text-left"
          >
            <div className="font-bold">{item.name}</div>
            <div>Stock: {item.quantity}</div>
            <div>£{Number(item.retail_cost).toFixed(2)}</div>
          </button>
        ))}

      </div>
    </div>
  );

  // ---------------- BASKET ----------------
  const BasketPanel = () => (
    <div className="bg-white p-3 rounded-xl shadow w-1/3 flex flex-col">

      <div className="flex-1 space-y-2 overflow-auto">

        {basket.map((i) => (
          <div key={i.id} className="border p-2 rounded flex justify-between">

            <div>
              <div className="font-bold">{i.name}</div>
              <div>Qty: {i.qty}</div>
              <div>£{(i.qty * i.retail_cost).toFixed(2)}</div>
            </div>

            <button
              onClick={() => removeOne(i.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              -1
            </button>

          </div>
        ))}

      </div>

      {/* BARCODE ALWAYS FOCUSED */}
      <div className="border-t pt-3 space-y-2">

        <input
          ref={barcodeRef}
          className="border p-2 rounded w-full"
          placeholder="Scan barcode..."
          value={barcode}
          onChange={(e) => handleScan(e.target.value)}
        />

        <div className="flex justify-between font-bold text-xl">
          <span>Total</span>
          <span>£{total.toFixed(2)}</span>
        </div>

        <div className="flex gap-2">

          <button
            onClick={clearBasket}
            className="bg-red-600 text-white px-3 py-2 rounded w-full"
          >
            VOID
          </button>

          <button
            onClick={() => setCheckoutOpen(true)}
            className="bg-green-600 text-white px-3 py-2 rounded w-full"
          >
            CHECKOUT
          </button>

        </div>

      </div>
    </div>
  );

  // ---------------- CHECKOUT ----------------
  const CheckoutModal = () =>
    checkoutOpen && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

        <div className="bg-white w-[350px] p-4 rounded-xl relative">

          <button
            onClick={() => setCheckoutOpen(false)}
            className="absolute top-2 right-3 text-xl"
          >
            ×
          </button>

          <h2 className="font-bold text-xl mb-3">Checkout</h2>

          <div className="flex gap-2 mb-3">

            <button
              onClick={() => setPaymentMethod("cash")}
              className={`flex-1 p-2 rounded ${
                paymentMethod === "cash"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Cash
            </button>

            <button
              onClick={() => setPaymentMethod("card")}
              className={`flex-1 p-2 rounded ${
                paymentMethod === "card"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Card
            </button>

          </div>

          <div className="font-bold mb-3">
            Total: £{total.toFixed(2)}
          </div>

          {paymentMethod === "cash" && (
            <>
              <input
                className="border p-2 w-full rounded"
                placeholder="Cash received"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
              />

              <div className="mt-2 font-semibold">
                Change: £
                {cashReceived
                  ? (Number(cashReceived) - total).toFixed(2)
                  : "0.00"}
              </div>
            </>
          )}

          <button
            onClick={() => {
              setBasket([]);
              setCheckoutOpen(false);
              setCashReceived("");
            }}
            className="mt-4 bg-green-600 text-white w-full py-2 rounded"
          >
            Complete Sale
          </button>

        </div>

      </div>
    );

  // ---------------- MAIN ----------------
  return (
    <div className="min-h-screen bg-gray-100 p-4 space-y-3">

      <TopBar />

      <div className="flex gap-3">

        {/* CENTER CATEGORY SYSTEM RESTORED */}
        {category === null ? <CategoryCenter /> : <ItemView />}

        <BasketPanel />

      </div>

      <CheckoutModal />

    </div>
  );
}