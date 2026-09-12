import { useEffect, useState } from "react";
import { supabase } from "./supabase";

function LoginScreen() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

async function handleLogin(event) {
event.preventDefault();
setError("");
setLoading(true);

 
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  setError(error.message);
}

setLoading(false);
 

}

return ( <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6"> <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm"> <div className="mb-8"> <h1 className="text-3xl font-bold text-gray-900">
Filament Tracker </h1>

 
      <p className="mt-2 text-gray-500">
        Sign in to manage your filament.
      </p>
    </div>

    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  </div>
</div>
 

);
}

function FilamentTracker({ session }) {
const [filaments, setFilaments] = useState([]);
const [loading, setLoading] = useState(true);

const [showAddForm, setShowAddForm] = useState(false);

const [brand, setBrand] = useState("");
const [type, setType] = useState("");
const [colour, setColour] = useState("");
const [grossWeight, setGrossWeight] = useState("");
const [spoolWeight, setSpoolWeight] = useState("");

const [amountsUsed, setAmountsUsed] = useState({});
const [updatingId, setUpdatingId] = useState(null);

const [editingId, setEditingId] = useState(null);

const [saving, setSaving] = useState(false);
const [error, setError] = useState("");

async function loadFilaments() {
setLoading(true);

 
const { data, error } = await supabase
  .from("filaments")
  .select("*")
  .order("remaining_weight", { ascending: false });

if (error) {
  console.error("SUPABASE LOAD ERROR:", error);
  setError(error.message);
  setLoading(false);
  return;
}

setFilaments(data);
setLoading(false);
 

}

useEffect(() => {
loadFilaments();
}, []);

async function logout() {
await supabase.auth.signOut();
}

async function addFilament(event) {
event.preventDefault();
setError("");

 
const gross = Number(grossWeight);
const spool = Number(spoolWeight);

if (!brand.trim() || !type.trim() || !colour.trim()) {
  setError("Please complete all fields.");
  return;
}

if (gross <= 0) {
  setError("Gross weight must be greater than 0.");
  return;
}

if (spool < 0) {
  setError("Spool weight cannot be negative.");
  return;
}

if (spool >= gross) {
  setError("Spool weight must be less than gross weight.");
  return;
}

const remaining = gross - spool;

setSaving(true);

const { error } = await supabase.from("filaments").insert([
  {
    brand: brand.trim(),
    type: type.trim(),
    colour: colour.trim(),
    gross_weight: gross,
    spool_weight: spool,
    remaining_weight: remaining,
  },
]);

if (error) {
  console.error("SUPABASE INSERT ERROR:", error);
  setError(error.message);
  setSaving(false);
  return;
}

setBrand("");
setType("");
setColour("");
setGrossWeight("");
setSpoolWeight("");

setShowAddForm(false);
setSaving(false);

await loadFilaments();
 

}

function startEditing(filament) {
setError("");
setEditingId(filament.id);

 
setBrand(filament.brand);
setType(filament.type);
setColour(filament.colour);
setGrossWeight(filament.gross_weight);
setSpoolWeight(filament.spool_weight);
 

}

function cancelEditing() {
setEditingId(null);

 
setBrand("");
setType("");
setColour("");
setGrossWeight("");
setSpoolWeight("");

setError("");
 

}

async function saveEdit(event, filament) {
event.preventDefault();
setError("");

 
const gross = Number(grossWeight);
const spool = Number(spoolWeight);

if (!brand.trim() || !type.trim() || !colour.trim()) {
  setError("Please complete all fields.");
  return;
}

if (gross <= 0) {
  setError("Gross weight must be greater than 0.");
  return;
}

if (spool < 0) {
  setError("Spool weight cannot be negative.");
  return;
}

if (spool >= gross) {
  setError("Spool weight must be less than gross weight.");
  return;
}

const originalRemaining = Number(filament.remaining_weight);
const originalGross = Number(filament.gross_weight);
const originalSpool = Number(filament.spool_weight);

const usedAmount = originalGross - originalSpool - originalRemaining;

const newInitialRemaining = gross - spool;
const newRemaining = Math.max(0, newInitialRemaining - usedAmount);

setSaving(true);

const { error } = await supabase
  .from("filaments")
  .update({
    brand: brand.trim(),
    type: type.trim(),
    colour: colour.trim(),
    gross_weight: gross,
    spool_weight: spool,
    remaining_weight: newRemaining,
    updated_at: new Date().toISOString(),
  })
  .eq("id", filament.id);

if (error) {
  console.error("SUPABASE EDIT ERROR:", error);
  setError(error.message);
  setSaving(false);
  return;
}

cancelEditing();
setSaving(false);

await loadFilaments();
 

}

async function deleteFilament(filament) {
setError("");

 
const confirmed = window.confirm(
  `Are you sure you want to delete ${filament.brand} ${filament.type} ${filament.colour}?`
);

if (!confirmed) {
  return;
}

setUpdatingId(filament.id);

const { error } = await supabase
  .from("filaments")
  .delete()
  .eq("id", filament.id);

if (error) {
  console.error("SUPABASE DELETE ERROR:", error);
  setError(error.message);
  setUpdatingId(null);
  return;
}

setUpdatingId(null);

await loadFilaments();
 

}

function handleAmountChange(id, value) {
setAmountsUsed((current) => ({
...current,
[id]: value,
}));
}

async function useFilament(filament) {
setError("");

 
const amount = Number(amountsUsed[filament.id]);
const currentWeight = Number(filament.remaining_weight);

if (!amount || amount <= 0) {
  setError("Enter an amount greater than 0.");
  return;
}

if (amount > currentWeight) {
  setError(
    `You only have ${currentWeight}g remaining on ${filament.brand} ${filament.type} ${filament.colour}.`
  );
  return;
}

const newWeight = Math.max(0, currentWeight - amount);

setUpdatingId(filament.id);

const { error } = await supabase
  .from("filaments")
  .update({
    remaining_weight: newWeight,
    updated_at: new Date().toISOString(),
  })
  .eq("id", filament.id);

if (error) {
  console.error("SUPABASE UPDATE ERROR:", error);
  setError(error.message);
  setUpdatingId(null);
  return;
}

setAmountsUsed((current) => ({
  ...current,
  [filament.id]: "",
}));

setUpdatingId(null);

await loadFilaments();
 

}

const typeCounts = filaments.reduce((counts, filament) => {
const filamentType = filament.type?.trim() || "Other";

 
counts[filamentType] = (counts[filamentType] || 0) + 1;

return counts;
 

}, {});

const typeOrder = Object.entries(typeCounts).sort((a, b) =>
a[0].localeCompare(b[0])
);

return ( <div className="min-h-screen bg-gray-100 p-8"> <div className="mx-auto max-w-7xl">

 
    {/* HEADER */}
    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Filament Tracker
        </h1>

        <p className="mt-1 text-gray-500">
          Manage your 3D printing filament.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError("");
          }}
          className="rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800"
        >
          {showAddForm ? "Cancel" : "Add Filament"}
        </button>

        <button
          onClick={logout}
          className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </div>

    {/* DASHBOARD */}
    {!loading && (
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Spools
          </p>

          <p className="mt-2 text-4xl font-bold text-gray-900">
            {filaments.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">
            Filament Types
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {typeOrder.length === 0 ? (
              <p className="text-sm text-gray-400">
                No filament yet
              </p>
            ) : (
              typeOrder.map(([filamentType, count]) => (
                <div
                  key={filamentType}
                  className="rounded-lg bg-gray-100 px-4 py-3"
                >
                  <p className="text-sm font-medium text-gray-500">
                    {filamentType}
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {count}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )}

    {/* ADD FILAMENT */}
    {showAddForm && (
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Add Filament
        </h2>

        <form
          onSubmit={addFilament}
          className="mt-6 grid gap-5 md:grid-cols-2"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Brand
            </label>

            <input
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="e.g. Bambu Lab"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Type
            </label>

            <input
              value={type}
              onChange={(event) => setType(event.target.value)}
              placeholder="e.g. PLA"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Colour
            </label>

            <input
              value={colour}
              onChange={(event) => setColour(event.target.value)}
              placeholder="e.g. Black"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Gross Weight (g)
            </label>

            <input
              type="number"
              min="0"
              step="0.1"
              value={grossWeight}
              onChange={(event) => setGrossWeight(event.target.value)}
              placeholder="e.g. 1250"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Spool Weight (g)
            </label>

            <input
              type="number"
              min="0"
              step="0.1"
              value={spoolWeight}
              onChange={(event) => setSpoolWeight(event.target.value)}
              placeholder="e.g. 250"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Remaining Weight
            </label>

            <div className="rounded-lg bg-gray-100 px-4 py-3 font-semibold text-gray-900">
              {grossWeight && spoolWeight
                ? `${Math.max(
                    0,
                    Number(grossWeight) - Number(spoolWeight)
                  )}g`
                : "—"}
            </div>
          </div>

          {error && (
            <div className="md:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Filament"}
            </button>
          </div>
        </form>
      </div>
    )}

    {/* ERROR */}
    {error && !showAddForm && !editingId && (
      <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    )}

    {/* FILAMENT LIST */}
    <div className="mt-8">
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : filaments.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            No filament yet
          </h2>

          <p className="mt-2 text-gray-500">
            Add your first spool to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filaments.map((filament) => (
            <div
              key={filament.id}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              {editingId === filament.id ? (
                <form
                  onSubmit={(event) => saveEdit(event, filament)}
                  className="grid gap-5 md:grid-cols-2"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Brand
                    </label>

                    <input
                      value={brand}
                      onChange={(event) => setBrand(event.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Type
                    </label>

                    <input
                      value={type}
                      onChange={(event) => setType(event.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Colour
                    </label>

                    <input
                      value={colour}
                      onChange={(event) => setColour(event.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Gross Weight (g)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={grossWeight}
                      onChange={(event) =>
                        setGrossWeight(event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Spool Weight (g)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={spoolWeight}
                      onChange={(event) =>
                        setSpoolWeight(event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      New Remaining Weight
                    </label>

                    <div className="rounded-lg bg-gray-100 px-4 py-3 font-semibold text-gray-900">
                      {grossWeight && spoolWeight
                        ? `${Math.max(
                            0,
                            Number(grossWeight) -
                              Number(spoolWeight) -
                              Math.max(
                                0,
                                Number(filament.gross_weight) -
                                  Number(filament.spool_weight) -
                                  Number(filament.remaining_weight)
                              )
                          )}g`
                        : "—"}
                    </div>
                  </div>

                  {error && (
                    <div className="md:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 md:col-span-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {filament.brand}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {filament.type} · {filament.colour}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      Gross: {filament.gross_weight}g · Spool:{" "}
                      {filament.spool_weight}g
                    </p>
                  </div>

                  <div className="lg:min-w-[150px] lg:text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {filament.remaining_weight}g
                    </p>

                    <p className="text-sm text-gray-500">
                      remaining
                    </p>
                  </div>

                  <div className="flex items-end gap-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Use (g)
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={amountsUsed[filament.id] || ""}
                        onChange={(event) =>
                          handleAmountChange(
                            filament.id,
                            event.target.value
                          )
                        }
                        placeholder="50"
                        className="w-28 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                      />
                    </div>

                    <button
                      onClick={() => useFilament(filament)}
                      disabled={updatingId === filament.id}
                      className="rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingId === filament.id
                        ? "Updating..."
                        : "Use"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(filament)}
                      className="rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteFilament(filament)}
                      disabled={updatingId === filament.id}
                      className="rounded-lg border border-red-300 px-4 py-3 font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="mt-6 text-right text-xs text-gray-400">
      Signed in as {session.user.email}
    </div>
  </div>
</div>
 

);
}

function App() {
const [session, setSession] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
let mounted = true;

 
supabase.auth.getSession().then(({ data }) => {
  if (mounted) {
    setSession(data.session);
    setLoading(false);
  }
});

const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session);
});

return () => {
  mounted = false;
  subscription.unsubscribe();
};
 

}, []);

if (loading) {
return ( <div className="flex min-h-screen items-center justify-center bg-gray-100"> <p className="text-gray-500">Loading...</p> </div>
);
}

if (!session) {
return <LoginScreen />;
}

return <FilamentTracker session={session} />;
}

export default App;
