import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="h-full w-64 bg-white border-r flex flex-col">

      {/* HEADER */}
      <div className="p-4 font-bold text-lg border-b">
        POS SYSTEM
      </div>

      {/* SCROLLABLE MENU */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">

        <button className="w-full text-left p-2 rounded bg-gray-100 hover:bg-gray-200"
          onClick={() => navigate("/")}>
          Portal
        </button>

        <button className="w-full text-left p-2 rounded bg-gray-100 hover:bg-gray-200"
          onClick={() => navigate("/filament")}>
          Filament
        </button>

        <button className="w-full text-left p-2 rounded bg-gray-100 hover:bg-gray-200"
          onClick={() => navigate("/inventory")}>
          Inventory
        </button>

        <button className="w-full text-left p-2 rounded bg-gray-100 hover:bg-gray-200"
          onClick={() => navigate("/scanner")}>
          Scanner
        </button>

        <button className="w-full text-left p-2 rounded bg-gray-100 hover:bg-gray-200"
          onClick={() => navigate("/barcodes")}>
          Barcodes
        </button>

        <button className="w-full text-left p-2 rounded bg-gray-100 hover:bg-gray-200"
          onClick={() => navigate("/pos")}>
          POS
        </button>

        <button className="w-full text-left p-2 rounded bg-gray-100 hover:bg-gray-200"
          onClick={() => navigate("/account")}>
          Account
        </button>

      </div>

    </div>
  );
}