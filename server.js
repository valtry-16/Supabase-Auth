import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.text()); // REQUIRED for Kodular

/* =========================
   SUPABASE CLIENT
   ========================= */
const SUPABASE_URL = "https://kaomdcuskpzdmpxrnyxw.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthb21kY3Vza3B6ZG1weHJueXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTU5OTUsImV4cCI6MjA4NjAzMTk5NX0.w8y65DEhInjzt6Rg954vrZdiUnTRTqxQ1ko1kCoZBhI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* =========================
   SAFE BODY PARSER (CRITICAL)
   ========================= */
function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

/* =========================
   TEMP SESSION STORE
   (for demo / Kodular)
   ========================= */
const tempSessions = {};

/* =========================
   1️⃣ SEND OTP
   ========================= */
app.post("/send-otp", async (req, res) => {
  try {
    const { email } = getBody(req);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      console.error("SUPABASE OTP ERROR:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================
   2️⃣ VERIFY OTP
   ========================= */
app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = getBody(req);

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error || !data?.session) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Store session internally
    tempSessions[email] = data.session;

    res.json({
      success: true,
      message: "OTP verified. Please set password.",
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================
   3️⃣ SET PASSWORD
   ========================= */
app.post("/set-password", async (req, res) => {
  try {
    const { email, password } = getBody(req);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const session = tempSessions[email];

    if (!session) {
      return res.status(400).json({
        success: false,
        message: "OTP not verified or session expired",
      });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // IMPORTANT: activate session
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

    delete tempSessions[email];

    res.json({
      success: true,
      message: "Signup complete. Password set successfully.",
      user: data.user,
    });
  } catch (err) {
    console.error("SET PASSWORD ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================
   4️⃣ LOGIN
   ========================= */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = getBody(req);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

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
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =========================
   SERVER
   ========================= */
app.listen(3000, () => {
  console.log("✅ Auth server running on port 3000");
});
