
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './server/db';
import { UserModel } from './server/models/User';

async function testMongo() {
  console.log("Testing MongoDB Connection...");
  const connected = await connectDB();
  if (!connected) {
    console.error("Failed to connect to MongoDB");
    process.exit(1);
  }

  console.log("Connected successfully. Trying to create a test user...");
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    const newUser = new UserModel({
      name: "Test User",
      email: testEmail,
      passwordHash: "hash",
      role: "Beneficiary"
    });
    await newUser.save();
    console.log("User created successfully:", newUser.email);

    console.log("Trying to create duplicate user...");
    try {
      const dupUser = new UserModel({
        name: "Test User 2",
        email: testEmail,
        passwordHash: "hash",
        role: "Beneficiary"
      });
      await dupUser.save();
      console.error("Duplicate user creation should have failed!");
    } catch (e: any) {
      if (e.code === 11000) {
        console.log("Caught duplicate key error correctly.");
      } else {
        console.error("Caught unexpected error:", e);
      }
    }

  } catch (err) {
    console.error("Error creating user:", err);
  }

  process.exit(0);
}

testMongo();
