import { Link } from "react-router-dom";

export default function Navbar({ user, logout }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex justify-between items-center mb-6">

      <div className="font-bold text-lg">
        Filament System
      </div>

      <Link
        to="/barcodes"
        className="px-4 py-2 bg-blue-600 text-white rounded-xl"
      >
        Barcode
      </Link>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          {user?.username}
        </span>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition"
        >
          Logout
        </button>
      </div>

    </div>
  );
}