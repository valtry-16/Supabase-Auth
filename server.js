import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  "https://kaomdcuskpzdmpxrnyxw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthb21kY3Vza3B6ZG1weHJueXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTU5OTUsImV4cCI6MjA4NjAzMTk5NX0.w8y65DEhInjzt6Rg954vrZdiUnTRTqxQ1ko1kCoZBhI"
);

// 🧠 TEMP STORE (email → session)
// For CLI / demo purpose
const tempSessions = {};

/* =========================
   1️⃣ SEND OTP
   ========================= */
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email required" });
  }

  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  res.json({
    success: true,
    message: "OTP sent to email",
  });
});

/* =========================
   2️⃣ VERIFY OTP (STORE SESSION)
   ========================= */
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email",
  });

  if (error || !data.session) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired OTP",
    });
  }

  // ✅ STORE FULL SESSION (CRITICAL)
  tempSessions[email] = data.session;

  res.json({
    success: true,
    message: "OTP verified. Please set password.",
  });
});


/* =========================
   3️⃣ SET PASSWORD (FINAL SIGNUP)
   ========================= */
app.post("/set-password", async (req, res) => {
  const { email, password } = req.body;

  const session = tempSessions[email];

  if (!session) {
    return res.status(400).json({
      success: false,
      message: "Auth session missing or OTP not verified",
    });
  }

  // Create fresh client
  const userClient = createClient(
    "https://kaomdcuskpzdmpxrnyxw.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthb21kY3Vza3B6ZG1weHJueXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTU5OTUsImV4cCI6MjA4NjAzMTk5NX0.w8y65DEhInjzt6Rg954vrZdiUnTRTqxQ1ko1kCoZBhI"
  );

  // 🔑 THIS IS THE FIX
  await userClient.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  const { data, error } = await userClient.auth.updateUser({
    password,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  // Cleanup
  delete tempSessions[email];

  res.json({
    success: true,
    message: "Signup complete. Password set.",
    user: data.user,
  });
});


/* =========================
   4️⃣ LOGIN (NORMAL)
   ========================= */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }

  res.json({
    success: true,
    user: data.user,
    session: data.session,
  });
});

app.listen(3000, () => {
  console.log("✅ Auth server running on port 3000");
});
