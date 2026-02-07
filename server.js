import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ Backend can safely use anon key
const supabase = createClient(
  "https://kaomdcuskpzdmpxrnyxw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthb21kY3Vza3B6ZG1weHJueXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTU5OTUsImV4cCI6MjA4NjAzMTk5NX0.w8y65DEhInjzt6Rg954vrZdiUnTRTqxQ1ko1kCoZBhI"
);

// SIGN UP
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  res.json({
    success: true,
    user: data.user,
  });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    return res.status(401).json({ success: false, message: error.message });
  }

  res.json({
    success: true,
    user: data.user,
    session: data.session,
  });
});

app.listen(3000, () => {
  console.log("Auth server running on port 3000");
});
