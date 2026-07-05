import React from "react";

export default function Portal() {
  return (
    <div className="p-8 max-w-5xl mx-auto">

      <h1 className="text-4xl font-bold mb-2">
        Robin's Inventory & POS System
      </h1>

      <p className="text-gray-600 mb-8">
        Welcome to the Inventory Management and Point of Sale system. Use the
        navigation menu on the left-hand side to access each section of the
        application. If you have any issues speak to Robin where there will be a charge of £5 or a can of monster.
      </p>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Getting Started</h2>

        <ol className="list-decimal ml-6 space-y-2">
          <li>Select the required page using the sidebar.</li>
          <li>Use the Inventory Tracker to manage all products.</li>
          <li>Use the Inventory Adjuster for quick stock increases or decreases by barcode.</li>
          <li>Generate and print barcodes from the Barcode List page.</li>
          <li>Open the POS page to sell products and process transactions.</li>
          <li>Use the Scanner page to identify products by barcode.</li>
        </ol>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-3">Inventory & Filament</h2>

          <ul className="list-disc ml-6 space-y-2">
            <li>Add new products.</li>
            <li>Edit existing items.</li>
            <li>Monitor stock levels.</li>
            <li>Print barcode labels (Inventory Only).</li>
            <li>Use Inventory Adjuster for quick stock corrections.</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-3">Point of Sale</h2>

          <ul className="list-disc ml-6 space-y-2">
            <li>Select a product category.</li>
            <li>Add items by clicking them or scanning a barcode.</li>
            <li>Review the basket before checkout.</li>
            <li>Select Cash or Card when completing a sale.</li>
            <li>For cash payments, enter the amount received to calculate change.</li>
          </ul>
        </div>

      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        Version 1.0 • Robin's Inventory & POS System
      </div>

    </div>
  );
}