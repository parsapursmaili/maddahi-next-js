// actions/auth.js
"use server";

export async function checkPassword(inputPassword) {
  const serverPassword = process.env.PASS;

  if (inputPassword === serverPassword) {
    return 1;
  } else {
    return 0;
  }
}
