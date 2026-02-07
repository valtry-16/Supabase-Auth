import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kaomdcuskpzdmpxrnyxw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthb21kY3Vza3B6ZG1weHJueXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTU5OTUsImV4cCI6MjA4NjAzMTk5NX0.w8y65DEhInjzt6Rg954vrZdiUnTRTqxQ1ko1kCoZBhI";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
