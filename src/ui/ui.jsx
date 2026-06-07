import React from "react";

export function Page({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {children}
      </div>
    </div>
  );
}

export function Card({ children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {children}
    </div>
  );
}

export function Button({ variant = "primary", ...props }) {
  const base =
    "px-4 py-2 rounded-xl font-medium transition hover:opacity-90";

  const styles = {
    primary: "bg-black text-white",
    danger: "bg-red-500 text-white",
    secondary: "bg-gray-200 text-black",
    success: "bg-green-600 text-white",
  };

  return (
    <button className={`${base} ${styles[variant]}`} {...props} />
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className="border rounded-xl p-3 w-full focus:ring-2 focus:ring-black"
    />
  );
}