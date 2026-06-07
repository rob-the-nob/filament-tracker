import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import Navbar from "../components/Navbar";

import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Cell,
} from "recharts";

export default function FilamentTracker({ user, logout }) {
  const [filaments, setFilaments] = useState([]);

  const [form, setForm] = useState({
    name: "",
    colour: "",
    material: "",
    effect: "",
    netweight: "",
    spoolweight: "",
  });

  const [usageInputs, setUsageInputs] = useState({});
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [addWeight, setAddWeight] = useState(null);
  const [weight, setWeight] = useState("");

  const colourMap = {
    Black: "#111827",
    White: "#e5e7eb",
    Red: "#ef4444",
    Blue: "#3b82f6",
    Green: "#22c55e",
    Yellow: "#eab308",
    Orange: "#f97316",
    Purple: "#a855f7",
    Pink: "#ec4899",
    Grey: "#6b7280",
    Gold: "#facc15",
    Silver: "#9ca3af",
    Brown: "#964B00",
    "Light Blue": "#60a5fa",
    Clear: "#d1d5db",
  };

  const load = async () => {
    const { data, error } = await supabase
      .from("filaments")
      .select("*")
      .order("remaining", { ascending: false });

    if (!error) setFilaments(data);
  };

  useEffect(() => {
    load();
  }, []);

  // CREATE
  const addFilament = async () => {
    const net = Number(form.netweight);
    const spool = Number(form.spoolweight);

    if (!form.name || !net) return;

    await supabase.from("filaments").insert([
      {
        ...form,
        netweight: net,
        spoolweight: spool,
        remaining: net - spool,
      },
    ]);

    setForm({
      name: "",
      colour: "",
      material: "",
      effect: "",
      netweight: "",
      spoolweight: "",
    });

    load();
  };

  // USE
  const useFilament = async (f) => {
    const amt = Number(usageInputs[f.id]);
    if (!amt) return;

    await supabase
      .from("filaments")
      .update({
        remaining: Math.max(0, f.remaining - amt),
      })
      .eq("id", f.id);

    setUsageInputs((p) => ({ ...p, [f.id]: "" }));
    load();
  };

  // DELETE
  const deleteFilament = async (id) => {
    await supabase.from("filaments").delete().eq("id", id);
    load();
  };

  // EDIT SAVE
  const saveEdit = async () => {
    await supabase
      .from("filaments")
      .update({
        name: editing.name,
        colour: editing.colour,
        material: editing.material,
        effect: editing.effect,
        netweight: Number(editing.netweight),
        spoolweight: Number(editing.spoolweight),
        remaining:
          Number(editing.netweight) - Number(editing.spoolweight),
      })
      .eq("id", editing.id);

    setEditing(null);
    load();
  };

  // ADD WEIGHT
  const addWeightConfirm = async () => {
    const amt = Number(weight);
    if (!amt) return;

    await supabase
      .from("filaments")
      .update({
        remaining: addWeight.remaining + amt,
      })
      .eq("id", addWeight.id);

    setAddWeight(null);
    setWeight("");
    load();
  };

  const chartData = filaments.map((f) => ({
    name: f.name,
    remaining: f.remaining,
    colour: colourMap[f.colour] || "#111827",
  }));

  const total = filaments.length;

  const materials = useMemo(() => {
    const m = { PLA: 0, "PLA+": 0, PETG: 0, ABS: 0, ASA: 0, TPU: 0 };

    filaments.forEach((f) => {
      if (m[f.material] !== undefined) m[f.material]++;
    });

    return m;
  }, [filaments]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <Navbar user={user} logout={logout} />

      {/* HEADER */}
      <div className="flex gap-4 items-center mb-6 bg-white p-4 rounded-2xl shadow-sm">

        <img src="/favicon.png" className="w-14 h-14 rounded-xl" />

        <div>
          <h1 className="text-3xl font-bold">
            Filament Tracker
          </h1>
          <p className="text-sm text-gray-500">
            Designed by Robin Armitage
          </p>
        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4 mb-6">

        <div className="bg-white p-5 rounded-2xl shadow-sm">
          Total: {total}
        </div>

        {Object.entries(materials).map(([k, v]) => (
          <div key={k} className="bg-white p-5 rounded-2xl shadow-sm">
            {k}: {v}
          </div>
        ))}

      </div>

      {/* ADD BAR */}
      <div className="bg-white p-5 rounded-2xl shadow-sm grid grid-cols-6 gap-3 mb-6">

        <input
          className="border rounded-xl p-3"
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          className="border rounded-xl p-3"
          placeholder="Colour"
          value={form.colour}
          onChange={(e) =>
            setForm({ ...form, colour: e.target.value })
          }
        />

        {/* MATERIAL DROPDOWN FIXED */}
        <select
          className="border rounded-xl p-3"
          value={form.material}
          onChange={(e) =>
            setForm({ ...form, material: e.target.value })
          }
        >
          <option value="">Material</option>
          <option value="PLA">PLA</option>
          <option value="PLA+">PLA+</option>
          <option value="PETG">PETG</option>
          <option value="ABS">ABS</option>
          <option value="ASA">ASA</option>
          <option value="TPU">TPU</option>
        </select>

        <input
          className="border rounded-xl p-3"
          placeholder="Effect"
          value={form.effect}
          onChange={(e) =>
            setForm({ ...form, effect: e.target.value })
          }
        />

        <input
          className="border rounded-xl p-3"
          placeholder="Net Weight"
          value={form.netweight}
          onChange={(e) =>
            setForm({ ...form, netweight: e.target.value })
          }
        />

        <button
          onClick={addFilament}
          className="bg-black text-white rounded-xl"
        >
          Add
        </button>

      </div>

      {/* CHART */}
      <div className="bg-white p-5 rounded-2xl shadow-sm mb-6">

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="remaining">
              {chartData.map((e, i) => (
                <Cell key={i} fill={e.colour} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th>Colour</th>
              <th>Material</th>
              <th>Remaining</th>
              <th>Use</th>
              <th>Menu</th>
            </tr>
          </thead>

          <tbody>
            {filaments.map((f) => (
              <tr key={f.id} className="border-t hover:bg-gray-50">

                <td className="p-4">{f.name}</td>
                <td>{f.colour}</td>
                <td>{f.material}</td>
                <td>{f.remaining}g</td>

                <td>
                  <input
                    className="border rounded-xl w-20 p-2"
                    value={usageInputs[f.id] || ""}
                    onChange={(e) =>
                      setUsageInputs({
                        ...usageInputs,
                        [f.id]: e.target.value,
                      })
                    }
                  />

                  <button
                    onClick={() => useFilament(f)}
                    className="ml-2 bg-red-500 text-white px-3 py-2 rounded-xl"
                  >
                    Update
                  </button>
                </td>

                <td>
                  <button
                    onClick={() =>
                      setSelected(selected === f.id ? null : f.id)
                    }
                  >
                    ⋮
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-[500px]">

            <h2>Edit</h2>

            <input
              value={editing.name}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
            />

            <select
              value={editing.material}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  material: e.target.value,
                })
              }
            >
              <option>PLA</option>
              <option>PLA+</option>
              <option>PETG</option>
              <option>ABS</option>
              <option>ASA</option>
              <option>TPU</option>
            </select>

            <button onClick={saveEdit}>
              Save
            </button>

          </div>
        </div>
      )}

    </div>
  );
}