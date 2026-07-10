import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Portal from "./pages/Portal";
import InventoryTracker from "./pages/InventoryTracker";
import InventoryAdjuster from "./pages/InventoryAdjuster";
import FilamentTracker from "./pages/FilamentTracker";
import Scanner from "./pages/Scanner";
import BarcodeList from "./pages/BarcodeList";
import POS from "./pages/POS";
import AccountSettings from "./pages/AccountSettings";

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
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Portal />} />
        <Route path="inventory" element={<InventoryTracker />} />
        <Route path="inventory-adjust" element={<InventoryAdjuster />} />
        <Route path="filament" element={<FilamentTracker />} />
        <Route path="scanner" element={<Scanner />} />
        <Route path="barcode-list" element={<BarcodeList />} />
        <Route path="pos" element={<POS />} />
        <Route path="account" element={<AccountSettings />} />
      </Route>
    </Routes>
  );
} 