import mongoose from "mongoose";

let cached = globalThis.__mongooseCache;

if (!cached) {
  cached = { conn: null, promise: null };
  globalThis.__mongooseCache = cached;
}

export async function connectDB() {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Please add it to your .env.local file."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
