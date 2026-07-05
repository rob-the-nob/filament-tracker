import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const login = async () => {
    if (!username || !password) {
      alert("Please enter a username and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username.trim())
        .single();

      if (error) {
        console.error(error);
        alert("Unable to access users table.");
        return;
      }

      if (!data) {
        alert("User not found.");
        return;
      }

      if (data.password !== password) {
        alert("Incorrect password.");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          username: data.username,
          name: data.name,
          role: data.role,
        })
      );

      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Unexpected error during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-96 rounded-xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center mb-6">
          Login Page
        </h1>

        <input
          type="text"
          placeholder="Username"
          className="border rounded w-full p-3 mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") login();
          }}
        />

        <input
          type="password"
          placeholder="Password"
          className="border rounded w-full p-3 mb-5"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") login();
          }}
        />

        <button
          onClick={login}
          disabled={loading}
          className="bg-black hover:bg-gray-800 text-white w-full py-3 rounded"
        >
          {loading ? "Logging In..." : "Login"}
        </button>

      </div>
    </div>
  );
}