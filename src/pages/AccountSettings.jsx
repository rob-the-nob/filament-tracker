import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) return;

    setUser(u);
    setUsername(u.username);
  }, []);

  const save = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({ username, password })
      .eq("username", user.username);

    if (error) {
      alert("Update failed");
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({ ...user, username })
    );

    alert("Saved");
  };

  if (!user) return <div>Please login</div>;

  return (
    <div className="max-w-xl bg-white p-4 rounded shadow">

      <h1 className="text-xl font-bold mb-3">Account Settings</h1>

      <input
        className="border p-2 w-full mb-2"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-2"
        type="password"
        placeholder="New password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={save}
        className="bg-black text-white w-full py-2 rounded"
      >
        Save
      </button>

    </div>
  );
}