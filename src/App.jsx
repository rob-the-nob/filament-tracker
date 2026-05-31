import React, { useEffect, useMemo, useState } from "react";

import { supabase } from "./supabase";
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

export default function App() {
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
  const [selectedFilament, setSelectedFilament] = useState(null);
  const [editingFilament, setEditingFilament] = useState(null);
  const [addingWeight, setAddingWeight] = useState(null);
  const [weightToAdd, setWeightToAdd] = useState("");


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
    Gray: "#6b7280",
    Gold: "#facc15",
    Silver: "#9ca3af",
    Brown: "#964B00",
    Light Blue: "#60a5fa",
  };

  const loadFilaments = async () => {
    const { data, error } = await supabase
      .from("filaments")
      .select("*")
      .order("remaining", { ascending: false });

    console.log(data);
    console.log(error);

    if (!error && data) {
      setFilaments(data);
    }
  };

  useEffect(() => {
    loadFilaments();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("filaments-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "filaments",
        },
        () => {
          loadFilaments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addFilament = async () => {
  const netweight = Number(form.netweight);
  const spoolweight = Number(form.spoolweight);

  if (
    !form.name ||
    !form.colour ||
    !form.material ||
    !form.effect ||
    !netweight ||
    !spoolweight
  ) {
    return;
  }

  const newFilament = {
    id: Date.now(),
    name: form.name,
    colour: form.colour,
    material: form.material,
    effect: form.effect,
    netweight,
    spoolweight,
    remaining: netweight - spoolweight,
  };

  const { error } = await supabase
    .from("filaments")
    .insert([newFilament]);

  if (!error) {
    setForm({
      name: "",
      colour: "",
      material: "",
      effect: "",
      netweight: "",
      spoolweight: "",
    });

    loadFilaments();
  } else {
    console.log(error);
  }
};

  const decreaseFilament = async (filament) => {
    const amount = Number(usageInputs[filament.id]);

    if (!amount || amount <= 0) {
      return;
    }



    const updatedRemaining = Math.max(
      0,
      filament.remaining - amount
    );

    await supabase
      .from("filaments")
      .update({
        remaining: updatedRemaining,
      })
      .eq("id", filament.id);

    setUsageInputs((prev) => ({
      ...prev,
      [filament.id]: "",
    }));

    loadFilaments();
  };

  const increaseFilament = async () => {
  const amount = Number(weightToAdd);

  if (!amount || amount <= 0) {
    console.log("Invalid amount");
    return;
  }

  const { data, error } = await supabase
    .from("filaments")
    .update({
      remaining: Number(addingWeight.remaining) + amount,
    })
    .eq("id", addingWeight.id)
    .select();

  if (!error) {
    loadFilaments();
    setAddingWeight(null);
    setWeightToAdd("");
  }
};


  const deleteFilament = async (id) => {
    await supabase
      .from("filaments")
      .delete()
      .eq("id", id);

    setSelectedFilament(null);

    loadFilaments();
  };

  const saveEdit = async () => {
    await supabase
      .from("filaments")
      .update({
        name: editingFilament.name,
        colour: editingFilament.colour,
        material: editingFilament.material,
        effect: editingFilament.effect,
        netweight: Number(editingFilament.netweight),
        spoolweight: Number(editingFilament.spoolweight),
        remaining:
          Number(editingFilament.netweight) -
          Number(editingFilament.spoolweight),
      })
      .eq("id", editingFilament.id);

    setEditingFilament(null);

    loadFilaments();
  };

  const totalRemaining = useMemo(() => {
    return filaments.reduce(
      (sum, filament) => sum + filament.remaining,
      0
    );
  }, [filaments]);

  const totalSpools = filaments.length;

  const chartData = filaments.map((filament) => ({
    filament: filament.name,
    remaining: filament.remaining,
    colour: colourMap[filament.colour] || "#6366f1",
  }));

  const materialTotals = useMemo(() => {
  const materials = {
    PLA: 0,
    "PLA+": 0,
    PETG: 0,
    ABS: 0,
    ASA: 0,
    TPU: 0,
  };

  filaments.forEach((filament) => {
    const material = filament.material?.toUpperCase();

    if (materials.hasOwnProperty(material)) {
      materials[material]++;
    }
  });

  return materials;
}, [filaments]);
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        <div>
          <h1 className="text-4xl font-bold">
            Stewart&apos;s Filament Tracker™
          </h1>

          <p className="text-gray-600 mt-2">
            Designed and built by Robin Armitage Version 1.8
          </p>
        </div>

       <div className="grid md:grid-cols-4 gap-4">

  <div className="bg-white rounded-2xl shadow p-6">
    <h2 className="text-sm text-gray-500">
      Total Spools
    </h2>

    <p className="text-3xl font-bold mt-2">
      {totalSpools}
    </p>
  </div>

  {Object.entries(materialTotals).map(
    ([material, total]) => (
      <div
        key={material}
        className="bg-white rounded-2xl shadow p-6"
      >
        <h2 className="text-sm text-gray-500">
          {material}
        </h2>

        <p className="text-3xl font-bold mt-2">
          {total} Spools
        </p>
      </div>
    )
  )}

</div>

        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-2xl font-semibold mb-4">
            Add Filament
          </h2>

          <div className="grid md:grid-cols-6 gap-4">

            <input
              className="border rounded-xl p-3"
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />

            <input
              className="border rounded-xl p-3"
              placeholder="Colour"
              value={form.colour}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  colour: e.target.value,
                }))
              }
            />

          <select
            value={form.material}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                material: e.target.value,
              }))
            }
            className="border rounded-xl p-3"
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
                setForm((prev) => ({
                  ...prev,
                  effect: e.target.value,
                }))
              }
            />

            <input
              type="number"
              className="border rounded-xl p-3"
              placeholder="Net Weight"
              value={form.netweight}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  netweight: e.target.value,
                }))
              }
            />

            <input
              type="number"
              className="border rounded-xl p-3"
              placeholder="Spool Weight"
              value={form.spoolweight}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  spoolweight: e.target.value,
                }))
              }
            />

          </div>

         <button
          onClick={addFilament}
          


          className="mt-4 bg-black text-white px-3 py-6 rounded-xl"
        >
          Add Filament
        </button>

        </div>

        <div className="bg-white rounded-2xl shadow p-6">

          <div className="h-96">

            <ResponsiveContainer width="100%" height="100%">

              <BarChart data={chartData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="filament" />

                <YAxis 
                  domain={[0, 1000]}
                  ticks={[0,100,200,300,400,500,600,700,800,900,1000]}
                  interval={0}
                />
                

                <Tooltip />

                <Legend />

                <Bar dataKey="remaining" name="Remaining (g)">

                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.colour}
                    />
                  ))}

                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b text-left">

                <th className="p-3">Name</th>
                <th className="p-3">Colour</th>
                <th className="p-3">Material</th>
                <th className="p-3">Effect</th>
                <th className="p-3">Remaining</th>
                <th className="p-3">Use</th>
                <th className="p-3">Menu</th>

              </tr>

            </thead>

            <tbody>

              {filaments.map((filament) => (

                <tr
                  key={filament.id}
                  className="border-b"
                >

                  <td className="p-3">
                    {filament.name}
                  </td>

                  <td className="p-3">
                    {filament.colour}
                  </td>

                  <td className="p-3">
                    {filament.material}
                  </td>

                  <td className="p-3">
                    {filament.effect}
                  </td>

                  <td className="p-3 font-bold">
                    {filament.remaining}g
                  </td>

                  <td className="p-3">

                    <div className="flex gap-2">

                      <input
                        type="number"
                        placeholder="Used"
                        value={
                          usageInputs[filament.id] || ""
                        }
                        onChange={(e) =>
                          setUsageInputs((prev) => ({
                            ...prev,
                            [filament.id]:
                              e.target.value,
                          }))
                        }
                        className="border rounded-xl p-2 w-24"
                      />

                      <button
                        onClick={() =>
                          decreaseFilament(filament)
                        }
                        className="bg-red-500 text-white px-4 rounded-xl"
                      >
                        Update
                      </button>

                    </div>

                  </td>

                  <td className="p-3 relative">

                    <button
                      onClick={() =>
                        setSelectedFilament(
                          selectedFilament ===
                            filament.id
                            ? null
                            : filament.id
                        )
                      }
                      className="text-2xl px-3"
                    >
                      ⋮
                    </button>

                    {selectedFilament ===
                      filament.id && (

                      <div className="absolute right-0 mt-2 bg-white border shadow rounded-xl w-40 z-50">

                        <button
                          onClick={() => {
                            setEditingFilament({
                              ...filament,
                            });

                            setSelectedFilament(
                              null
                            );
                          }}
                          className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                        >
                          Edit
                        </button>

                          <button
                          onClick={() => {
                            setAddingWeight(filament);
                            setSelectedFilament(
                              null
                            );
                          }}
                          className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                        >
                          Add Weight
                        </button> 

                        <button
                          onClick={() =>
                            deleteFilament(
                              filament.id
                            )
                          }
                          className="block w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600"
                        >
                          Delete
                        </button>

                      </div>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {addingWeight && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">

      <h2 className="text-2xl font-bold">
        Add Weight
      </h2>

      <input
        type="number"
        placeholder="Weight to add (g)"
        value={weightToAdd}
        onChange={(e) => setWeightToAdd(e.target.value)}
      />

      <div className="flex justify-end gap-3">

        <button
          onClick={() => {
            setAddingWeight(null);
            setWeightToAdd("");
          }}
          className="border px-5 py-3 rounded-xl"
        >
          Cancel
        </button>

        <button
          onClick={increaseFilament}
          className="bg-green-600 text-white px-5 py-3 rounded-xl"
        >
          Add
        </button>

      </div>

    </div>
  </div>
)}

        

        {editingFilament && (

          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl space-y-4">

              <h2 className="text-2xl font-bold">
                Edit Filament
              </h2>

              <div className="grid grid-cols-2 gap-4">

                <input
                  className="border rounded-xl p-3"
                  value={editingFilament.name}
                  onChange={(e) =>
                    setEditingFilament((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />

                <input
                  className="border rounded-xl p-3"
                  value={editingFilament.colour}
                  onChange={(e) =>
                    setEditingFilament((prev) => ({
                      ...prev,
                      colour: e.target.value,
                    }))
                  }
                />

                <input
                  className="border rounded-xl p-3"
                  value={editingFilament.material}
                  onChange={(e) =>
                    setEditingFilament((prev) => ({
                      ...prev,
                      material: e.target.value,
                    }))
                  }
                />

                <input
                  className="border rounded-xl p-3"
                  value={editingFilament.effect}
                  onChange={(e) =>
                    setEditingFilament((prev) => ({
                      ...prev,
                      effect: e.target.value,
                    }))
                  }
                />

                <input
                  type="number"
                  className="border rounded-xl p-3"
                  value={editingFilament.netweight}
                  onChange={(e) =>
                    setEditingFilament((prev) => ({
                      ...prev,
                      netweight: e.target.value,
                    }))
                  }
                />

                <input
                  type="number"
                  className="border rounded-xl p-3"
                  value={editingFilament.spoolweight}
                  onChange={(e) =>
                    setEditingFilament((prev) => ({
                      ...prev,
                      spoolweight: e.target.value,
                    }))
                  }
                />

              </div>

              <div className="flex justify-end gap-3">

                <button
                  onClick={() =>
                    setEditingFilament(null)
                  }
                  className="border px-5 py-3 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  onClick={saveEdit}
                  className="bg-black text-white px-5 py-3 rounded-xl"
                >
                  Save
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}