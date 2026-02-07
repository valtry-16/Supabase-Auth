import readline from "readline";
import { signUp, login, getCurrentUser } from "./auth.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function runAuth() {
  const choice = await ask("Choose option (1 = Signup, 2 = Login): ");

  const email = await ask("Enter email: ");
  const password = await ask("Enter password: ");

  if (choice === "1") {
    await signUp(email.trim(), password.trim());
  } else if (choice === "2") {
    await login(email.trim(), password.trim());
  } else {
    console.log("Invalid option");
    rl.close();
    return;
  }

  const user = await getCurrentUser();
  console.log("Current user:", user);

  rl.close();
}

runAuth();
