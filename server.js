import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.text());

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
  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { email } = body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
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
   2️⃣ VERIFY OTP (STORE SESSION)
   ========================= */
app.post("/verify-otp", async (req, res) => {
  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { email, otp } = body;

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

    if (error || !data.session) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

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
   3️⃣ SET PASSWORD (FINAL SIGNUP)
   ========================= */
app.post("/set-password", async (req, res) => {
  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { email, password } = body;

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
        message: "Auth session missing or OTP not verified",
      });
    }

    const userClient = createClient(
      "https://kaomdcuskpzdmpxrnyxw.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthb21kY3Vza3B6ZG1weHJueXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTU5OTUsImV4cCI6MjA4NjAzMTk5NX0.w8y65DEhInjzt6Rg954vrZdiUnTRTqxQ1ko1kCoZBhI"
    );

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
      message: "Signup complete. Password set.",
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
   4️⃣ LOGIN (NORMAL)
   ========================= */
app.post("/login", async (req, res) => {
  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { email, password } = body;

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

app.listen(3000, () => {
  console.log("✅ Auth server running on port 3000");
});
