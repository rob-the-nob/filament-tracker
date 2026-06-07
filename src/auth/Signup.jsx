import React, { useState } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error) nav("/portal");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow w-full max-w-md space-y-4">

        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>

        <input
          className="border p-3 rounded-xl w-full"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-3 rounded-xl w-full"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signup}
          className="w-full bg-black text-white p-3 rounded-xl"
        >
          Sign Up
        </button>

      </div>
    </div>
  );
}