import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Barcode from "react-barcode";
import ReactDOMServer from "react-dom/server";


export default function BarcodeList() {
  const [items, setItems] = useState([]);

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

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const { data, error } = await supabase
      .from("inventory")
      .select("*")
      .order("name");

    if (!error) {
      setItems(data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h1 className="text-3xl font-bold">
          Barcode Catalogue
        </h1>

        <p className="text-gray-500">
          All inventory barcodes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">

        {items.map((item) => (
  <div
    key={item.id}
    className="bg-white rounded-2xl shadow p-4"
  >
    <div className="font-bold text-center mb-2">
      {item.name}
    </div>

    <div className="flex justify-center">
      <Barcode
        value={String(item.barcode)}
        format="CODE128"
        width={1.5}
        height={50}
        displayValue={true}
      />
    </div>

    <button
      onClick={() => printLabel(item)}
      className="w-full mt-3 bg-blue-600 text-white py-2 rounded-xl"
    >
      Print Label
    </button>
  </div>
))}

      </div>

    </div>
  );
}