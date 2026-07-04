import React from "react";

export default function Portal() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-3xl font-bold">
          Home Dashboard
        </h1>

        <p className="text-gray-600 mt-1">
          Inventory • POS • Tracking System
        </p>
      </div>

      {/* NAVIGATION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* INVENTORY */}
        <button
          onClick={() => window.location.href = "/inventory"}
          className="bg-white p-6 rounded-2xl shadow hover:bg-gray-50 text-left"
        >
          <div className="text-xl font-bold">
            Inventory Tracker
          </div>
          <div className="text-sm text-gray-500">
            Manage stock, categories & items
          </div>
        </button>

        {/* FILAMENT */}
        <button
          onClick={() => window.location.href = "/filament"}
          className="bg-white p-6 rounded-2xl shadow hover:bg-gray-50 text-left"
        >
          <div className="text-xl font-bold">
            Filament Tracker
          </div>
          <div className="text-sm text-gray-500">
            3D printing filament
          </div>
        </button>

        {/* POS */}
        <button
          onClick={() => window.location.href = "/pos"}
          className="bg-white p-6 rounded-2xl shadow hover:bg-gray-50 text-left"
        >
          <div className="text-xl font-bold">
            POS System
          </div>
          <div className="text-sm text-gray-500">
            Barcode scanning & checkout
          </div>
        </button>

        <button
          onClick={() => window.location.href = "/inventory-adjust"}
          className="bg-white p-6 rounded-2xl shadow hover:bg-gray-50 text-left"
        >
          <div className="text-xl font-bold">
            Inventory Adjuster
          </div>
          <div className="text-sm text-gray-500">
            Adjust inventory stock
          </div>
        </button>

      </div>

    </div>
  );
}