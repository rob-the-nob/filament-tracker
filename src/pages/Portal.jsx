import React from "react";
import { useNavigate } from "react-router-dom";

export default function Portal() {
  const navigate = useNavigate();

  const tiles = [
    {
      title: "Inventory",
      desc: "Manage stock and warehouse items",
      path: "/inventory",
      img: "/theoadorables.png",
    },
    {
      title: "Filament Tracker",
      desc: "Track 3D printer filament usage",
      path: "/filament",
      img: "/favicon.png",
    },
    {
      title: "Barcode List",
      desc: "View and print all barcodes",
      path: "/barcodes",
      img: "/barcode.png",
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Home Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Click a logo to open a system
        </p>
      </div>

      {/* TILES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {tiles.map((t, i) => (
          <div
            key={i}
            onClick={() => navigate(t.path)}
            className="bg-white rounded-2xl shadow p-6 cursor-pointer hover:scale-105 transition flex flex-col items-center text-center"
          >

            {/* LOGO */}
            <img
              src={t.img}
              alt={t.title}
              className="w-24 h-24 object-contain mb-4"
            />

            {/* TITLE */}
            <h2 className="text-xl font-bold">
              {t.title}
            </h2>

            {/* DESC */}
            <p className="text-sm text-gray-500 mt-2">
              {t.desc}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
}