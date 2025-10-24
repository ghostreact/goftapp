#!/usr/bin/env node
import "dotenv/config";
import process from "node:process";
import { connectDB } from "../lib/mongoose.js";
import { ensureAdmin } from "../lib/ensure-admin.js";

async function main() {
  try {
    const connection = await connectDB();
    await ensureAdmin({ force: true });
    await connection.disconnect();
    console.log("[seed-admin] Admin account is ready.");
    process.exit(0);
  } catch (error) {
    console.error("[seed-admin] Failed to seed admin:", error);
    process.exit(1);
  }
}

main();
