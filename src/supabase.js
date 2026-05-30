import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://olsronowyrpydvpfltnd.supabase.co";

const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sc3Jvbm93eXJweWR2cGZsdG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTU5NjcsImV4cCI6MjA5NTUzMTk2N30.GWFVDnRDEe0wIA5HYSxgpqAOl-Nl1Caa3nW4wPl4S5s";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);