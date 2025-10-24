import bcrypt from "bcryptjs";
import User from "../models/User.js";

let ensurePromise = null;

function toBool(value) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

function sanitizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function runEnsure({ force }) {
  if (!force && !toBool(process.env.SEED_ON_BOOT)) {
    return null;
  }

  const name = sanitizeString(process.env.ADMIN_NAME);
  const emailRaw = sanitizeString(process.env.ADMIN_EMAIL);
  const usernameRaw = sanitizeString(process.env.ADMIN_USERNAME);
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !emailRaw || !password) {
    console.warn(
      "[ensureAdmin] Missing ADMIN_NAME/ADMIN_EMAIL/ADMIN_PASSWORD. Skip seeding."
    );
    return null;
  }

  const email = emailRaw.toLowerCase();
  const username = usernameRaw ? usernameRaw.toLowerCase() : null;

  let targetAdmin = await User.findOne({ role: "admin" }).sort({ createdAt: 1 });
  if (!targetAdmin && (email || username)) {
    const dupConditions = [];
    if (email) dupConditions.push({ email });
    if (username) dupConditions.push({ username });
    if (dupConditions.length) {
      targetAdmin = await User.findOne({ $or: dupConditions }).sort({
        updatedAt: -1,
      });
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);

  if (targetAdmin) {
    targetAdmin.name = name;
    targetAdmin.email = email;
    if (username) {
      targetAdmin.username = username;
    }
    targetAdmin.password = passwordHash;
    targetAdmin.role = "admin";
    targetAdmin.active = true;
    targetAdmin.profileModel = "Admin";
    await targetAdmin.save();

    const label = targetAdmin.email || targetAdmin.username || targetAdmin._id;
    console.log(`[ensureAdmin] Ensured admin account "${label}".`);
    return targetAdmin;
  }

  const adminDoc = await User.create({
    name,
    email,
    username: username || undefined,
    password: passwordHash,
    role: "admin",
    active: true,
    profileModel: "Admin",
  });

  const label = adminDoc.email || adminDoc.username || adminDoc._id;
  console.log(`[ensureAdmin] Created initial admin "${label}".`);
  return adminDoc;
}

export async function ensureAdmin(options = {}) {
  const { force = false } = options;

  if (force) {
    return runEnsure({ force: true });
  }

  if (!ensurePromise) {
    ensurePromise = runEnsure({ force: false }).catch((error) => {
      console.error("[ensureAdmin] Failed to seed admin:", error);
      ensurePromise = null;
      throw error;
    });
  }

  return ensurePromise;
}

export function shouldSeedAdmin() {
  return toBool(process.env.SEED_ON_BOOT);
}
