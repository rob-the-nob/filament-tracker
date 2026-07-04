import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function SalesHistory() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sales, setSales] = useState([]);

  // ---------------- LOAD SESSIONS ----------------
  const loadSessions = async () => {
    const { data } = await supabase
      .from("sessions")
      .select("*")
      .order("started_at", { ascending: false });

    if (data) setSessions(data);
  };

  // ---------------- LOAD SALES ----------------
  const loadSales = async (sessionId) => {
    const { data } = await supabase
      .from("sales")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (data) setSales(data);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const selectSession = (session) => {
    setSelectedSession(session);
    loadSales(session.id);
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-2xl font-bold mb-4">
        Sales History
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* SESSIONS */}
        <div className="bg-white p-4 rounded-xl shadow">

          <h2 className="font-bold mb-2">
            Sessions
          </h2>

          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => selectSession(s)}
              className="w-full text-left p-2 border-b hover:bg-gray-100"
            >
              <div className="font-bold">
                Session #{s.id}
              </div>

              <div className="text-sm">
                {s.status}
              </div>

              <div className="text-xs text-gray-500">
                {new Date(s.started_at).toLocaleString()}
              </div>
            </button>
          ))}
        </div>

        {/* SALES */}
        <div className="md:col-span-2 bg-white p-4 rounded-xl shadow">

          {!selectedSession ? (
            <div>
              Select a session to view sales
            </div>
          ) : (
            <>
              <h2 className="font-bold text-lg">
                Session #{selectedSession.id}
              </h2>

              <div className="text-sm text-gray-600 mt-1">
                Status: {selectedSession.status}
              </div>

              <div className="mt-4 border-t pt-3">

                <h3 className="font-bold mb-2">
                  Sales
                </h3>

                {sales.length === 0 && (
                  <div className="text-gray-500">
                    No sales in this session
                  </div>
                )}

                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="border-b py-2"
                  >
                    <div>
                      Sale #{sale.id} — £{sale.total}
                    </div>

                    <div className="text-xs text-gray-500">
                      {sale.payment} •{" "}
                      {new Date(
                        sale.created_at
                      ).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}