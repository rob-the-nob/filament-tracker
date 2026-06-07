import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Portal from "./pages/Portal";
import FilamentTracker from "./pages/FilamentTracker";
import InventoryTracker from "./pages/InventoryTracker";
import Scanner from "./pages/Scanner";

import DashboardLayout from "./layouts/DashboardLayout";

const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const ProtectedRoute = ({ children }) => {
  const user = getUser();
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Routes>

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* DASHBOARD WRAPPER (IMPORTANT - DO NOT REMOVE) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        <Route index element={<Portal />} />
        <Route path="filament" element={<FilamentTracker />} />
        <Route path="inventory" element={<InventoryTracker />} />
        <Route path="scanner" element={<Scanner />} />

      </Route>

    </Routes>
  );
}