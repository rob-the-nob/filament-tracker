import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      <div className="w-64 h-full overflow-y-auto bg-white border-r">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">

        <div className="flex justify-end items-center gap-4 p-4 bg-gray-100">

          <div className="bg-white px-3 py-1 rounded shadow text-sm">
            {user?.name || "Not logged in"}
          </div>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>

        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </div>

      </div>
    </div>
  );
}