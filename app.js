const API_BASE = "https://supabase-auth-seue.onrender.com";

const sessionOutput = document.getElementById("session-output");
const tabButtons = document.querySelectorAll(".tab");
const tabPanels = document.querySelectorAll(".tab-panel");
const steps = {
  1: document.querySelector(".step[data-step='1']"),
  2: document.querySelector(".step[data-step='2']"),
  3: document.querySelector(".step[data-step='3']"),
};

function setStatus(id, message, isError = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("ok", !isError);
  el.classList.toggle("err", isError);
}

function setSession(data) {
  sessionOutput.textContent = JSON.stringify(data, null, 2);
}

function setStepState(step, state) {
  const el = steps[step];
  if (!el) return;
  el.classList.toggle("active", state === "active");
  el.classList.toggle("done", state === "done");
}

function advanceStep(step) {
  setStepState(step, "done");
  setStepState(step + 1, "active");
}

function setButtonBusy(button, busy, label) {
  if (!button) return;
  if (!button.dataset.label) {
    button.dataset.label = button.textContent;
  }
  button.textContent = busy ? label : button.dataset.label;
  button.disabled = busy;
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function activateTab(name) {
  tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === name);
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${name}`);
  });
}

async function apiPost(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.message || "Request failed";
    throw new Error(message);
  }
  return data;
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => activateTab(btn.dataset.tab));
});

document.getElementById("send-otp").addEventListener("click", async () => {
  const button = document.getElementById("send-otp");
  setStatus("send-otp-status", "Sending code...");
  const email = getValue("signup-email");
  if (!email) {
    setStatus("send-otp-status", "Email is required", true);
    return;
  }

  try {
    setButtonBusy(button, true, "Sending...");
    const data = await apiPost("/send-otp", { email });
    setStatus("send-otp-status", data.message || "OTP sent", false);
    setSession(data);
    advanceStep(1);
  } catch (err) {
    setStatus("send-otp-status", err.message, true);
  } finally {
    setButtonBusy(button, false);
  }
});

document.getElementById("verify-otp-btn").addEventListener("click", async () => {
  const button = document.getElementById("verify-otp-btn");
  setStatus("verify-otp-status", "Verifying code...");
  const email = getValue("signup-email");
  const otp = getValue("verify-otp");

  if (!email || !otp) {
    setStatus("verify-otp-status", "Email and OTP are required", true);
    return;
  }

  try {
    setButtonBusy(button, true, "Verifying...");
    const data = await apiPost("/verify-otp", { email, otp });
    setStatus("verify-otp-status", data.message || "OTP verified", false);
    setSession(data);
    advanceStep(2);
  } catch (err) {
    setStatus("verify-otp-status", err.message, true);
  } finally {
    setButtonBusy(button, false);
  }
});

document.getElementById("set-password-btn").addEventListener("click", async () => {
  const button = document.getElementById("set-password-btn");
  setStatus("set-password-status", "Setting password...");
  const email = getValue("signup-email");
  const username = getValue("signup-username");
  const password = getValue("set-password");

  if (!email || !password || !username) {
    setStatus(
      "set-password-status",
      "Email, username, and password are required",
      true
    );
    return;
  }

  try {
    setButtonBusy(button, true, "Saving...");
    const data = await apiPost("/set-password", { email, password, username });
    setStatus(
      "set-password-status",
      data.message || "Password set",
      false
    );
    setSession(data);
    setStepState(3, "done");
  } catch (err) {
    setStatus("set-password-status", err.message, true);
  } finally {
    setButtonBusy(button, false);
  }
});

document.getElementById("login-btn").addEventListener("click", async () => {
  const button = document.getElementById("login-btn");
  setStatus("login-status", "Logging in...");
  const email = getValue("login-email");
  const password = getValue("login-password");

  if (!email || !password) {
    setStatus("login-status", "Email and password are required", true);
    return;
  }

  try {
    setButtonBusy(button, true, "Signing in...");
    const data = await apiPost("/login", { email, password });
    setStatus("login-status", "Login successful", false);
    setSession(data);
  } catch (err) {
    setStatus("login-status", err.message, true);
  } finally {
    setButtonBusy(button, false);
  }
});
