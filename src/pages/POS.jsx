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

  // ---------------- AUTO FOCUS ----------------
  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const refocusBarcode = () => {
    setTimeout(() => barcodeRef.current?.focus(), 50);
  };

  // ---------------- LOAD ITEMS ----------------
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

  // ---------------- STOCK / BASKET ----------------
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

  const clearBasket = () => setBasket([]);

  const total = basket.reduce(
    (s, i) => s + i.qty * Number(i.retail_cost),
    0
  );

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

  // ---------------- CASH KEYPAD ----------------
  const addCash = (val) => {
    setCashReceived((prev) => {
      if (val === "." && prev.includes(".")) return prev;
      return prev + val;
    });
  };

  const backspaceCash = () =>
    setCashReceived((p) => p.slice(0, -1));

  const clearCash = () => setCashReceived("");

  const setExact = () =>
    setCashReceived(total.toFixed(2));

  const addTender = (amount) =>
    setCashReceived((prev) =>
      String(Number(prev || 0) + amount)
    );

  // ---------------- UI ----------------
  const categoriesList = useMemo(() => {
    return categories;
  }, [categories]);

  // ---------------- TOP BAR ----------------
  const TopBar = () => (
    <div className="bg-white p-3 rounded-xl shadow flex justify-between">
      <div className="font-bold">POS SYSTEM</div>
      <div className="font-bold">£{total.toFixed(2)}</div>
    </div>
  );

  // ---------------- CATEGORY VIEW ----------------
  const CategoryCenter = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {categoriesList.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className="p-10 text-xl font-bold rounded-xl bg-gray-200 hover:bg-gray-300"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );

  // ---------------- ITEMS ----------------
  const ItemView = () => (
    <div className="flex-1 bg-white p-4 rounded-xl shadow relative">

      <button
        onClick={() => setCategory(null)}
        className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded"
      >
        ← Return
      </button>

      <h2 className="text-center font-bold text-xl mb-4">
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
            className="bg-gray-100 p-3 rounded"
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

      <input
        ref={barcodeRef}
        className="border p-2 rounded w-full mt-2"
        placeholder="Scan barcode..."
        value={barcode}
        onChange={(e) => handleScan(e.target.value)}
      />

      <div className="flex justify-between font-bold text-xl mt-2">
        <span>Total</span>
        <span>£{total.toFixed(2)}</span>
      </div>

      <button
        onClick={() => setCheckoutOpen(true)}
        className="bg-green-600 text-white w-full mt-2 py-2 rounded"
      >
        CHECKOUT
      </button>
    </div>
  );

  // ---------------- CHECKOUT ----------------
  const CheckoutModal = () =>
    checkoutOpen && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center">

        <div className="bg-white w-[380px] p-4 rounded-xl relative">

          <button
            onClick={() => setCheckoutOpen(false)}
            className="absolute top-2 right-3 text-xl"
          >
            ×
          </button>

          <h2 className="font-bold text-xl mb-3">Checkout</h2>

          {/* CASH / CARD */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setPaymentMethod("cash")}
              className={`flex-1 p-2 rounded font-bold ${
                paymentMethod === "cash"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Cash
            </button>

            <button
              onClick={() => setPaymentMethod("card")}
              className={`flex-1 p-2 rounded font-bold ${
                paymentMethod === "card"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Card
            </button>
          </div>

          <div className="font-bold mb-2">
            Total: £{total.toFixed(2)}
          </div>

          {/* CASH MODE */}
          {paymentMethod === "cash" && (
            <div className="space-y-2">

              <div className="border p-3 text-center text-xl font-bold">
                £{cashReceived || "0"}
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button onClick={() => addTender(5)} className="bg-gray-200 p-2 rounded">+£5</button>
                <button onClick={() => addTender(10)} className="bg-gray-200 p-2 rounded">+£10</button>
                <button onClick={() => addTender(20)} className="bg-gray-200 p-2 rounded">+£20</button>
                <button onClick={setExact} className="bg-yellow-400 p-2 rounded">Exact</button>
              </div>

              <div className="grid grid-cols-3 gap-2">

                {[1,2,3,4,5,6,7,8,9].map((n) => (
                  <button
                    key={n}
                    onClick={() => addCash(String(n))}
                    className="bg-gray-200 p-3 rounded font-bold"
                  >
                    {n}
                  </button>
                ))}

                <button onClick={clearCash} className="bg-yellow-500 text-white p-3 rounded">C</button>

                <button onClick={() => addCash("0")} className="bg-gray-200 p-3 rounded font-bold">0</button>

                <button onClick={() => addCash(".")} className="bg-blue-500 text-white p-3 rounded font-bold">.</button>

              </div>

              <button
                onClick={backspaceCash}
                className="bg-red-500 text-white w-full p-2 rounded"
              >
                Delete
              </button>

              <div className="text-center font-semibold">
                Change: £
                {cashReceived
                  ? (Number(cashReceived) - total).toFixed(2)
                  : "0.00"}
              </div>

            </div>
          )}

          {/* CARD MODE */}
          {paymentMethod === "card" && (
            <div className="text-center p-4 bg-blue-50 rounded">
              Card payment selected — confirm sale
            </div>
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
        {category === null ? <CategoryCenter /> : <ItemView />}
        <BasketPanel />
      </div>

      <CheckoutModal />
    </div>
  );
}