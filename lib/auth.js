import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies as nextCookies } from "next/headers";
import User from "@/models/User";
import { connectDB } from "./mongo.js";

const SECURE_COOKIE = process.env.NODE_ENV === "production";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

const accessTokenTtl =
  parseDurationToSeconds(process.env.ACCESS_TOKEN_EXPIRES) ?? 60 * 15;
const refreshTokenTtl =
  parseDurationToSeconds(process.env.REFRESH_TOKEN_EXPIRES) ?? 60 * 60 * 24 * 30;

const accessTokenExpiresIn = secondsToHumanReadable(accessTokenTtl) || "15m";
const refreshTokenExpiresIn =
  secondsToHumanReadable(refreshTokenTtl) || "30d";

function secondsToHumanReadable(value) {
  if (!value) return null;
  if (value % (60 * 60 * 24) === 0) {
    const days = value / (60 * 60 * 24);
    return `${days}d`;
  }
  if (value % (60 * 60) === 0) {
    const hours = value / (60 * 60);
    return `${hours}h`;
  }
  if (value % 60 === 0) {
    const minutes = value / 60;
    return `${minutes}m`;
  }
  return `${value}s`;
}

export function parseDurationToSeconds(input) {
  if (!input || typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  const match = trimmed.match(/^(\d+)([smhd])$/i);
  if (!match) {
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) ? numeric : null;
  }

  const value = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    default:
      return null;
  }
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password, hashed) {
  return bcrypt.compare(password, hashed);
}

export function signAccessToken(user) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    },
    secret,
    {
      expiresIn: accessTokenExpiresIn,
    }
  );
}

export function signRefreshToken(user) {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      type: "refresh",
    },
    secret,
    {
      expiresIn: refreshTokenExpiresIn,
    }
  );
}

export function verifyAccessToken(token) {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }
  return jwt.verify(token, secret);
}

export function verifyRefreshToken(token) {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }
  return jwt.verify(token, secret);
}

export function setAuthCookies(response, { accessToken, refreshToken }) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: SECURE_COOKIE,
    sameSite: "lax",
    path: "/",
    maxAge: accessTokenTtl,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: SECURE_COOKIE,
    sameSite: "lax",
    path: "/",
    maxAge: refreshTokenTtl,
  });
}

export function clearAuthCookies(response) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: SECURE_COOKIE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: SECURE_COOKIE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getUserFromRequest(request) {
  const cookie = request.cookies?.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!cookie) {
    throw new Error("missing_access_token");
  }

  const payload = verifyAccessToken(cookie);
  await connectDB();
  const user = await User.findById(payload.sub).populate("profile");
  if (!user || !user.active) {
    throw new Error("user_not_found");
  }
  return user;
}

export async function getUserFromCookies() {
  const cookieStore = await nextCookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const payload = verifyAccessToken(token);
    await connectDB();
    const user = await User.findById(payload.sub).populate("profile");
    if (!user || !user.active) {
      return null;
    }
    return user;
  } catch (error) {
    console.error("getUserFromCookies error:", error);
    return null;
  }
}

export function serializeUser(user) {
  if (!user) return null;

  const base =
    typeof user.toObject === "function"
      ? user.toObject({ virtuals: true })
      : user;
  const plain = JSON.parse(JSON.stringify(base));
  const profile = plain.profile ?? null;

  return {
    id: plain._id,
    name: plain.name,
    email: plain.email,
    username: plain.username,
    role: plain.role,
    active: plain.active,
    profile,
  };
}

export function authorizeRole(user, allowedRoles = []) {
  if (!user) {
    throw new Error("unauthorized");
  }
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    throw new Error("forbidden");
  }
  return true;
}
