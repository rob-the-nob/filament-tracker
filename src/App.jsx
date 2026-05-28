import React, { useMemo, useState } from "react";
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
  const [selectedFilament, setSelectedFilament] = useState(null);
  const [editingFilament, setEditingFilament] = useState(null);
  const [logViewer, setLogViewer] = useState(null);
  const [editLogs, setEditLogs] = useState([]);

  const [filters, setFilters] = useState({
    material: "All",
    colour: "All",
    effect: "All",
    minRemaining: 0,
    maxRemaining: 1000,
  });

  const [form, setForm] = useState({
    name: "",
    colour: "",
    material: "",
    effect: "",
    netWeight: "",
    spoolWeight: "",
  });

  const [usageInputs, setUsageInputs] = useState({});

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
    Grey: "#6b7280",
    Brown: "#92400e",
    Gold: "#facc15",
    Silver: "#9ca3af",
  };

  const addEditLog = (filamentId, filamentName, action, details) => {
    setEditLogs((prev) => [
      {
        id: Date.now(),
        filamentId,
        filamentName,
        action,
        details,
        timestamp: new Date().toLocaleString(),
      },
      ...prev,
    ]);
  };

  const addFilament = () => {
    const netWeight = Number(form.netWeight);
    const spoolWeight = Number(form.spoolWeight);

    if (
      !form.name ||
      !form.colour ||
      !form.material ||
      !form.effect ||
      !netWeight ||
      !spoolWeight ||
      netWeight <= spoolWeight
    ) {
      return;
    }

    const newFilament = {
      id: Date.now(),
      name: form.name,
      colour: form.colour,
      material: form.material,
      effect: form.effect,
      netWeight,
      spoolWeight,
      remaining: netWeight - spoolWeight,
    };

    setFilaments((prev) => [...prev, newFilament]);

    addEditLog(
      newFilament.id,
      newFilament.name,
      "Created",
      "Filament added"
    );

    setForm({
      name: "",
      colour: "",
      material: "",
      effect: "",
      netWeight: "",
      spoolWeight: "",
    });
  };

  const decreaseFilament = (id) => {
    const amount = Number(usageInputs[id]);

    if (!amount || amount <= 0) {
      return;
    }

    setFilaments((prev) =>
      prev.map((filament) => {
        if (filament.id !== id) {
          return filament;
        }

        const updatedRemaining = Math.max(
          0,
          filament.remaining - amount
        );

        addEditLog(
          filament.id,
          filament.name,
          "Usage Updated",
          `${amount}g used`
        );

        return {
          ...filament,
          remaining: updatedRemaining,
        };
      })
    );

    setUsageInputs((prev) => ({
      ...prev,
      [id]: "",
    }));
  };

  const deleteFilament = (id) => {
    const filament = filaments.find((f) => f.id === id);

    if (!filament) {
      return;
    }

    addEditLog(filament.id, filament.name, "Deleted", "Filament deleted");

    setFilaments((prev) => prev.filter((f) => f.id !== id));
    setSelectedFilament(null);
  };

  const saveEdit = () => {
    if (!editingFilament) {
      return;
    }

    const netWeight = Number(editingFilament.netWeight);
    const spoolWeight = Number(editingFilament.spoolWeight);

    if (netWeight <= spoolWeight) {
      return;
    }

    setFilaments((prev) =>
      prev.map((filament) => {
        if (filament.id !== editingFilament.id) {
          return filament;
        }

        return {
          ...editingFilament,
          netWeight,
          spoolWeight,
          remaining: netWeight - spoolWeight,
        };
      })
    );

    addEditLog(
      editingFilament.id,
      editingFilament.name,
      "Edited",
      "Filament updated"
    );

    setEditingFilament(null);
  };

  const totalRemaining = useMemo(
    () => filaments.reduce((sum, filament) => sum + filament.remaining, 0),
    [filaments]
  );

  const totalSpools = filaments.length;

  const lowStock = useMemo(
    () => filaments.filter((filament) => filament.remaining < 200),
    [filaments]
  );

  const sortedFilaments = useMemo(
    () => [...filaments].sort((a, b) => b.remaining - a.remaining),
    [filaments]
  );

  const uniqueMaterials = [
    "All",
    ...new Set(filaments.map((f) => f.material)),
  ];

  const uniqueColours = [
    "All",
    ...new Set(filaments.map((f) => f.colour)),
  ];

  const uniqueEffects = [
    "All",
    ...new Set(filaments.map((f) => f.effect)),
  ];

  const filteredFilaments = sortedFilaments.filter((filament) => {
    const materialMatch =
      filters.material === "All" ||
      filament.material === filters.material;

    const colourMatch =
      filters.colour === "All" || filament.colour === filters.colour;

    const effectMatch =
      filters.effect === "All" || filament.effect === filters.effect;

    const weightMatch =
      filament.remaining >= filters.minRemaining &&
      filament.remaining <= filters.maxRemaining;

    return materialMatch && colourMatch && effectMatch && weightMatch;
  });

  const chartData = filteredFilaments.map((filament) => ({
    filament: `${filament.name} ${filament.colour}`,
    remaining: filament.remaining,
    colour: colourMap[filament.colour] || "#6366f1",
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold">
            3D Printer Filament Tracker
          </h1>

          <p className="text-gray-600 mt-2">
            Manage and track your filament inventory.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-sm text-gray-500">Total Remaining</h2>
            <p className="text-3xl font-bold mt-2">{totalRemaining}g</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-sm text-gray-500">Total Spools</h2>
            <p className="text-3xl font-bold mt-2">{totalSpools}</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-sm text-gray-500">Low Stock Rolls</h2>
            <p className="text-3xl font-bold mt-2">{lowStock.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Add Filament</h2>

          <div className="grid md:grid-cols-6 gap-4">
            <input
              className="border rounded-xl p-3"
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />

            <input
              className="border rounded-xl p-3"
              placeholder="Colour"
              value={form.colour}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, colour: e.target.value }))
              }
            />

            <input
              className="border rounded-xl p-3"
              placeholder="Material"
              value={form.material}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, material: e.target.value }))
              }
            />

            <input
              className="border rounded-xl p-3"
              placeholder="Effect"
              value={form.effect}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, effect: e.target.value }))
              }
            />

            <input
              type="number"
              className="border rounded-xl p-3"
              placeholder="Net Weight"
              value={form.netWeight}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, netWeight: e.target.value }))
              }
            />

            <input
              type="number"
              className="border rounded-xl p-3"
              placeholder="Spool Weight"
              value={form.spoolWeight}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, spoolWeight: e.target.value }))
              }
            />
          </div>

          <button
            onClick={addFilament}
            className="mt-4 bg-black text-white px-6 py-3 rounded-xl"
          >
            Add Filament
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-nowrap gap-4 overflow-x-auto pb-2">
            <select
              value={filters.material}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  material: e.target.value,
                }))
              }
              className="border rounded-xl p-3 min-w-[180px]"
            >
              {uniqueMaterials.map((material) => (
                <option key={material}>{material}</option>
              ))}
            </select>

            <select
              value={filters.colour}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  colour: e.target.value,
                }))
              }
              className="border rounded-xl p-3 min-w-[180px]"
            >
              {uniqueColours.map((colour) => (
                <option key={colour}>{colour}</option>
              ))}
            </select>

            <select
              value={filters.effect}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  effect: e.target.value,
                }))
              }
              className="border rounded-xl p-3 min-w-[180px]"
            >
              {uniqueEffects.map((effect) => (
                <option key={effect}>{effect}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Min Weight"
              className="border rounded-xl p-3 min-w-[180px]"
              value={filters.minRemaining}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minRemaining: Number(e.target.value),
                }))
              }
            />

            <input
              type="number"
              placeholder="Max Weight"
              className="border rounded-xl p-3 min-w-[180px]"
              value={filters.maxRemaining}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxRemaining: Number(e.target.value),
                }))
              }
            />
          </div>

          <div className="h-96 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="filament" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar dataKey="remaining" name="Remaining (g)">
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.colour} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Colour</th>
                <th className="p-3">Material</th>
                <th className="p-3">Effect</th>
                <th className="p-3">Net</th>
                <th className="p-3">Spool</th>
                <th className="p-3">Remaining</th>
                <th className="p-3">Decrease</th>
                <th className="p-3">Menu</th>
              </tr>
            </thead>

            <tbody>
              {filteredFilaments.map((filament) => (
                <tr key={filament.id} className="border-b">
                  <td className="p-3">{filament.name}</td>
                  <td className="p-3">{filament.colour}</td>
                  <td className="p-3">{filament.material}</td>
                  <td className="p-3">{filament.effect}</td>
                  <td className="p-3">{filament.netWeight}g</td>
                  <td className="p-3">{filament.spoolWeight}g</td>
                  <td className="p-3 font-bold">
                    {filament.remaining}g
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Used"
                        value={usageInputs[filament.id] || ""}
                        onChange={(e) =>
                          setUsageInputs((prev) => ({
                            ...prev,
                            [filament.id]: e.target.value,
                          }))
                        }
                        className="border rounded-xl p-2 w-24"
                      />

                      <button
                        onClick={() => decreaseFilament(filament.id)}
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
                          selectedFilament === filament.id
                            ? null
                            : filament.id
                        )
                      }
                      className="text-2xl px-3"
                    >
                      ⋮
                    </button>

                    {selectedFilament === filament.id && (
                      <div className="absolute right-0 mt-2 bg-white border shadow rounded-xl w-52 z-50">
                        <button
                          onClick={() => {
                            setEditingFilament({ ...filament });
                            setSelectedFilament(null);
                          }}
                          className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteFilament(filament.id)}
                          className="block w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600"
                        >
                          Delete
                        </button>

                        <button
                          onClick={() => {
                            setLogViewer(filament.id);
                            setSelectedFilament(null);
                          }}
                          className="block w-full text-left px-4 py-3 hover:bg-gray-100"
                        >
                          View Edit Logs
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingFilament && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl space-y-4">
              <h2 className="text-2xl font-bold">Edit Filament</h2>

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
                  value={editingFilament.netWeight}
                  onChange={(e) =>
                    setEditingFilament((prev) => ({
                      ...prev,
                      netWeight: e.target.value,
                    }))
                  }
                />

                <input
                  type="number"
                  className="border rounded-xl p-3"
                  value={editingFilament.spoolWeight}
                  onChange={(e) =>
                    setEditingFilament((prev) => ({
                      ...prev,
                      spoolWeight: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingFilament(null)}
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

        {logViewer && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Edit Logs</h2>

                <button
                  onClick={() => setLogViewer(null)}
                  className="border px-4 py-2 rounded-xl"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3">
                {editLogs
                  .filter((log) => log.filamentId === logViewer)
                  .map((log) => (
                    <div
                      key={log.id}
                      className="border rounded-xl p-4 bg-gray-50"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{log.action}</span>
                        <span className="text-sm text-gray-500">
                          {log.timestamp}
                        </span>
                      </div>

                      <p className="mt-2">{log.details}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
