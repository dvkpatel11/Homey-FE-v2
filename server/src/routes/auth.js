/**
 * Authentication Routes
 * Handles auth, profile, and invitation endpoints
 */

import express from "express";
import { v4 as uuidv4 } from "uuid";
import { currentUser, householdMembers, households } from "../data/mockData.js";
import { delay } from "../utils/helpers.js";

const router = express.Router();

// Auth endpoints (bypassed but maintained for compatibility)
router.post("/login", async (req, res) => {
  await delay(500); // Simulate auth delay

  const { email, password } = req.body;

  if (!email || !password) {
    return res.error("VALIDATION_ERROR", "Email and password are required", null, 400);
  }

  // Always succeed in mock mode
  res.success(
    {
      access_token: "mock-access-token-",
      refresh_token: "mock-refresh-token-",
      user: currentUser,
      expires_in: 3600,
    },
    "Login successful"
  );
});

router.post("/refresh", async (req, res) => {
  await delay(200);

  res.success({
    access_token: "mock-access-token-",
    refresh_token: "mock-refresh-token-",
    user: currentUser,
    expires_in: 3600,
  });
});

router.post("/logout", async (req, res) => {
  await delay(100);
  res.success({ success: true }, "Logged out successfully");
});

// Profile endpoints
router.get("/", async (req, res) => {
  await delay(100);
  res.success(currentUser);
});

router.put("/", async (req, res) => {
  await delay(300);

  const { full_name, phone, avatar_url } = req.body;

  // Update current user data
  if (full_name) currentUser.full_name = full_name;
  if (phone) currentUser.phone = phone;
  if (avatar_url) currentUser.avatar_url = avatar_url;

  currentUser.updated_at = new Date().toISOString();

  res.success(currentUser, "Profile updated successfully");
});

router.post("/avatar", async (req, res) => {
  await delay(1000); // Simulate file upload

  // Simulate avatar upload
  const avatarUrl = `https://mock-cdn.homey.app/avatars/${uuidv4()}.jpg`;
  currentUser.avatar_url = avatarUrl;
  currentUser.updated_at = new Date().toISOString();

  res.success({ avatar_url: avatarUrl }, "Avatar uploaded successfully");
});

// Invitation endpoints
router.post("/validate", async (req, res) => {
  await delay(200);

  const { invite_code } = req.body;

  if (!invite_code) {
    return res.error("VALIDATION_ERROR", "Invite code is required", null, 400);
  }

  // Find household by invite code
  const household = households.find((h) => h.invite_code === invite_code);

  if (!household) {
    return res.error("NOT_FOUND", "Invalid invite code", null, 404);
  }

  res.success({
    household: {
      id: household.id,
      name: household.name,
      member_count: household.member_count,
      max_members: household.max_members,
    },
    valid: true,
  });
});

router.post("/join", async (req, res) => {
  await delay(500);

  const { invite_code } = req.body;

  if (!invite_code) {
    return res.error("VALIDATION_ERROR", "Invite code is required", null, 400);
  }

  const household = households.find((h) => h.invite_code === invite_code);

  if (!household) {
    return res.error("NOT_FOUND", "Invalid invite code", null, 404);
  }

  // Check if user is already a member
  const existingMember = householdMembers.find((m) => m.user_id === currentUser.id && m.household_id === household.id);

  if (existingMember) {
    return res.error("CONFLICT", "You are already a member of this household", null, 409);
  }

  // Add user to household
  const newMember = {
    id: uuidv4(),
    user_id: currentUser.id,
    full_name: currentUser.full_name,
    email: currentUser.email,
    avatar_url: currentUser.avatar_url,
    role: "member",
    joined_at: new Date().toISOString(),
  };

  householdMembers.push(newMember);
  household.member_count++;

  res.success(
    {
      household_id: household.id,
      role: "member",
      joined_at: newMember.joined_at,
    },
    "Successfully joined household"
  );
});

// Password reset (mock endpoints)
router.post("/reset-password", async (req, res) => {
  await delay(1000);
  const { email } = req.body;

  if (!email) {
    return res.error("VALIDATION_ERROR", "Email is required", null, 400);
  }

  res.success({ success: true }, "Password reset email sent");
});

router.post("/reset-password/confirm", async (req, res) => {
  await delay(500);
  const { token, password } = req.body;

  if (!token || !password) {
    return res.error("VALIDATION_ERROR", "Token and password are required", null, 400);
  }

  res.success({ success: true }, "Password reset successfully");
});

// Account management
router.delete("/account", async (req, res) => {
  await delay(1000);
  res.success({ success: true }, "Account deleted successfully");
});

router.post("/change-password", async (req, res) => {
  await delay(500);
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.error("VALIDATION_ERROR", "Current and new passwords are required", null, 400);
  }

  res.success({ success: true }, "Password changed successfully");
});

router.get("/verify", async (req, res) => {
  await delay(100);
  res.success({
    valid: true,
    user: currentUser,
  });
});

export default router;
