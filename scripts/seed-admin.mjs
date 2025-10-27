#!/usr/bin/env node
import "dotenv/config";
import process from "node:process";
import { connectDB } from "../lib/mongo.js";
import { ensureAdmin } from "../lib/ensureAdmin.js";

async function main() {
  try {
    const mongooseInstance = await connectDB();
    await ensureAdmin({ force: true });
    await mongooseInstance.disconnect();
    console.log("[seed-admin] Admin account is ready.");
    process.exit(0);
  } catch (error) {
    console.error("[seed-admin] Failed to seed admin:", error);
    process.exit(1);
  }
}

main();
