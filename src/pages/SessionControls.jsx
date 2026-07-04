import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function SessionControls() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------- LOAD ACTIVE SESSION ----------------
  const loadSession = async () => {
    const { data } = await supabase
      .from("sessions")
      .select("*")
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (data) setSession(data);
    else setSession(null);
  };

  useEffect(() => {
    loadSession();
  }, []);

  // ---------------- START SESSION ----------------
  const startSession = async () => {
    setLoading(true);

    console.log("START SESSION CLICKED");
    console.log(data, error);
    
    const { data } = await supabase
      .from("sessions")
      .insert([
        {
          status: "active",
          started_at: new Date(),
          total_sales: 0,
          transaction_count: 0,
        },
      ])
      .select()
      .single();

    setSession(data);
    setLoading(false);
  };

  // ---------------- PAUSE SESSION ----------------
  const pauseSession = async () => {
    if (!session) return;

    const { data } = await supabase
      .from("sessions")
      .update({ status: "paused" })
      .eq("id", session.id)
      .select()
      .single();

    setSession(data);
  };

  // ---------------- RESUME SESSION ----------------
  const resumeSession = async () => {
    if (!session) return;

    const { data } = await supabase
      .from("sessions")
      .update({ status: "active" })
      .eq("id", session.id)
      .select()
      .single();

    setSession(data);
  };

  // ---------------- END SESSION ----------------
  const endSession = async () => {
    if (!session) return;

    const { data } = await supabase
      .from("sessions")
      .update({
        status: "ended",
        ended_at: new Date(),
      })
      .eq("id", session.id)
      .select()
      .single();

    setSession(null);
  };

  // ---------------- SESSION STATS ----------------
  const refreshStats = async () => {
    if (!session) return;

    const { data: sales } = await supabase
      .from("sales")
      .select("*")
      .eq("session_id", session.id);

    if (!sales) return;

    const total = sales.reduce(
      (sum, s) => sum + Number(s.total || 0),
      0
    );

    const count = sales.length;

    await supabase
      .from("sessions")
      .update({
        total_sales: total,
        transaction_count: count,
      })
      .eq("id", session.id);

    loadSession();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h1 className="text-2xl font-bold">
          Session Controls
        </h1>
      </div>

      {/* STATUS CARD */}
      <div className="bg-white p-6 rounded-xl shadow">

        {session ? (
          <>
            <div className="text-lg font-bold">
              Session ID: {session.id}
            </div>

            <div className="mt-2">
              Status:{" "}
              <span className="font-bold">
                {session.status}
              </span>
            </div>

            <div className="mt-2">
              Sales: £{session.total_sales}
            </div>

            <div>
              Transactions: {session.transaction_count}
            </div>

            <div className="mt-2">
              Started:{" "}
              {new Date(session.started_at).toLocaleString()}
            </div>
          </>
        ) : (
          <div>No active session</div>
        )}
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-3">

        {!session && (
          <button
            onClick={startSession}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-xl"
          >
            Start Session
          </button>
        )}

        {session && session.status === "active" && (
          <button
            onClick={pauseSession}
            className="bg-yellow-500 text-white px-6 py-3 rounded-xl"
          >
            Pause Session
          </button>
        )}

        {session && session.status === "paused" && (
          <button
            onClick={resumeSession}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl"
          >
            Resume Session
          </button>
        )}

        {session && (
          <>
            <button
              onClick={refreshStats}
              className="bg-gray-800 text-white px-6 py-3 rounded-xl"
            >
              Refresh Stats
            </button>

            <button
              onClick={endSession}
              className="bg-red-600 text-white px-6 py-3 rounded-xl"
            >
              End Session
            </button>
          </>
        )}
      </div>
    </div>
  );
}