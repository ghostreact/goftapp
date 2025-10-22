import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../lib/mongoose.js";
import Admin from "../models/Admin.js";
import User from "../models/User.js";

async function run() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminUsername = process.env.ADMIN_USERNAME?.trim();
  const adminName = process.env.ADMIN_NAME?.trim() || "Default Admin";

  if (!adminPassword) {
    throw new Error(
      "ADMIN_PASSWORD is not set. Please configure it in your environment file."
    );
  }

  if (!adminUsername) {
    throw new Error(
      "ADMIN_USERNAME is not set. Please configure it in your environment file."
    );
  }

  await connectDB();

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let user =
      (await User.findOne({ username: adminUsername.toLowerCase() }).session(
        session
      )) || null;

    if (!user && adminEmail) {
      user = await User.findOne({ email: adminEmail }).session(session);
    }

    if (!user) {
      user = await User.findOne({ role: "admin" }).session(session);
    }

    if (user) {
      user.name = adminName;
      user.email = adminEmail || user.email;
      user.role = "admin";
      user.username = adminUsername;
      user.active = true;
      user.password = hashedPassword;
      await user.save({ session });
    } else {
      const created = await User.create(
        [
          {
            name: adminName,
            email: adminEmail,
            username: adminUsername,
            password: hashedPassword,
            role: "admin",
            active: true,
          },
        ],
        { session }
      );

      user = created[0];
    }

    let adminProfile = await Admin.findOne({ user: user._id }).session(
      session
    );

    if (!adminProfile) {
      adminProfile = await Admin.create(
        [
          {
            user: user._id,
            name: adminName,
            email: adminEmail,
            username: adminUsername,
            roles: ["admin"],
            active: true,
          },
        ],
        { session }
      );
      adminProfile = adminProfile[0];
    } else {
      adminProfile.name = adminName;
      adminProfile.email = adminEmail || adminProfile.email;
      adminProfile.username = adminUsername || adminProfile.username;
      adminProfile.roles = adminProfile.roles?.length
        ? adminProfile.roles
        : ["admin"];
      adminProfile.active = true;
      await adminProfile.save({ session });
    }

    user.profile = adminProfile._id;
    user.profileModel = "Admin";
    await user.save({ session });

    await session.commitTransaction();
    console.log("Admin account seeded successfully.");
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

run()
  .catch((error) => {
    console.error("Admin seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
