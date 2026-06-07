import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-white shadow p-4">

      <h1 className="text-xl font-bold mb-6">
        SaaS Dashboard
      </h1>

      <button
        onClick={() => navigate("/")}
        className="block w-full text-left p-2 hover:bg-gray-100 rounded"
      >
        Portal
      </button>

      <button
        onClick={() => navigate("/filament")}
        className="block w-full text-left p-2 hover:bg-gray-100 rounded"
      >
        Filament Tracker
      </button>

      <button
        onClick={() => navigate("/inventory")}
        className="block w-full text-left p-2 hover:bg-gray-100 rounded"
      >
        Inventory Tracker
      </button>

    </div>
  );
}