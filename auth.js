import { supabase } from "./supabase.js";

// SIGN UP
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Signup error:", error.message);
    return null;
  }

  console.log("Signup success:", data.user);
  return data.user;
}

// LOGIN
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error.message);
    return null;
  }

  console.log("Login success:", data.user);
  return data.user;
}

// LOGOUT
export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error.message);
  } else {
    console.log("Logged out successfully");
  }
}

// CURRENT USER
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
