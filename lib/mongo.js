import mongoose from "mongoose";
import { ensureAdmin, shouldSeedAdmin } from "./ensureAdmin.js";

const MONGO_URL =
  process.env.MONGO_URL?.trim() || process.env.MONGODB_URI?.trim() || "";
const MONGODB_DB =
  process.env.MONGODB_DB?.trim() || process.env.MONGO_DB?.trim() || "";

if (!MONGO_URL) {
  throw new Error(
    "Please set MONGO_URL or MONGODB_URI in environment variables"
  );
}

let cached = globalThis._mongoCache;
if (!cached) {
  cached = {
    conn: null,
    promise: null,
    synced: false,
    seeded: false,
    eventsBound: false,
  };
  globalThis._mongoCache = cached;
}

function bindConnectionEvents() {
  if (cached.eventsBound || process.env.NODE_ENV === "production") {
    return;
  }

  mongoose.connection.on("connected", () =>
    console.log("[MongoDB] connected")
  );
  mongoose.connection.on("error", (error) =>
    console.error("[MongoDB] connection error:", error)
  );
  mongoose.connection.on("disconnected", () =>
    console.warn("[MongoDB] disconnected")
  );

  cached.eventsBound = true;
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URL, {
        dbName: MONGODB_DB || undefined,
      })
      .then((mongooseInstance) => mongooseInstance)
      .catch((error) => {
        cached.promise = null;
        console.error("[MongoDB] Failed to connect:", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;

  bindConnectionEvents();

  if (process.env.MONGODB_SYNC_INDEXES === "true" && !cached.synced) {
    await mongoose.connection.syncIndexes();
    cached.synced = true;
    console.log("[MongoDB] Indexes synced");
  }

  if (shouldSeedAdmin() && !cached.seeded) {
    await ensureAdmin();
    cached.seeded = true;
  }

  return cached.conn;
}

export default connectDB;

const shouldEagerConnect =
  process.env.MONGO_EAGER_CONNECT === "true" ||
  (process.env.NODE_ENV !== "production" &&
    process.env.MONGO_EAGER_CONNECT !== "false");

if (shouldEagerConnect) {
  connectDB().catch((error) => {
    console.error("[MongoDB] Initial connect failed:", error);
  });
}
