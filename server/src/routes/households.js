/**
 * Household Routes
 * Handles household management, members, and settings
 */

import express from "express";
import { v4 as uuidv4 } from "uuid";
import {
  currentUser,
  generateBalances,
  generateDashboardData,
  householdMembers,
  households,
  householdSettings,
} from "../data/mockData.js";
import { delay, validateRequired } from "../utils/helpers.js";

const router = express.Router();

// Get all households for current user
router.get("/", async (req, res) => {
  await delay(200);
  console.log("Fetching households for user:", currentUser.id);
  // Filter households where user is a member
  const userHouseholdqs = households.filter((household) =>
    householdMembers.some((member) => member.user_id === currentUser.id && member.household_id === household.id)
  );
  const userHouseholds = households[0];

  res.success(userHouseholds);
});

// Create new household
router.post("/", async (req, res) => {
  await delay(500);

  const { name, max_members = 5, address, lease_start_date, lease_end_date, data_retention_days = 365 } = req.body;

  try {
    validateRequired(req.body, ["name"]);
  } catch (error) {
    return res.error("VALIDATION_ERROR", error.message, null, 400);
  }

  if (max_members < 2 || max_members > 20) {
    return res.error("VALIDATION_ERROR", "Max members must be between 2 and 20", null, 400);
  }

  const newHousehold = {
    id: uuidv4(),
    name,
    max_members,
    address: address || null,
    lease_start_date: lease_start_date || null,
    lease_end_date: lease_end_date || null,
    admin_id: currentUser.id,
    invite_code: generateInviteCode(),
    member_count: 1,
    data_retention_days,
    role: "admin",
    joined_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Add admin as first member
  const adminMember = {
    id: uuidv4(),
    user_id: currentUser.id,
    full_name: currentUser.full_name,
    email: currentUser.email,
    avatar_url: currentUser.avatar_url,
    role: "admin",
    joined_at: new Date().toISOString(),
  };

  households.push(newHousehold);
  householdMembers.push(adminMember);

  res.success(newHousehold, "Household created successfully");
});

// Get specific household
router.get("/:id", async (req, res) => {
  await delay(100);

  const household = households.find((h) => h.id === req.params.id);

  if (!household) {
    return res.error("NOT_FOUND", "Household not found", null, 404);
  }

  res.success(household);
});

// Update household
router.put("/:id", async (req, res) => {
  await delay(300);

  const household = households.find((h) => h.id === req.params.id);

  if (!household) {
    return res.error("NOT_FOUND", "Household not found", null, 404);
  }

  // Update fields
  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== undefined && key !== "id") {
      household[key] = req.body[key];
    }
  });

  household.updated_at = new Date().toISOString();

  res.success(household, "Household updated successfully");
});

// Delete household
router.delete("/:id", async (req, res) => {
  await delay(500);

  const householdIndex = households.findIndex((h) => h.id === req.params.id);

  if (householdIndex === -1) {
    return res.error("NOT_FOUND", "Household not found", null, 404);
  }

  // Remove household and its members
  households.splice(householdIndex, 1);
  const memberIndicesToRemove = [];
  householdMembers.forEach((member, index) => {
    if (member.household_id === req.params.id) {
      memberIndicesToRemove.push(index);
    }
  });

  // Remove members in reverse order to maintain indices
  memberIndicesToRemove.reverse().forEach((index) => {
    householdMembers.splice(index, 1);
  });

  res.success({ success: true }, "Household deleted successfully");
});

// Get household members
router.get("/:id/members", async (req, res) => {
  await delay(150);

  const members = householdMembers.filter((m) => m.household_id === req.params.id);
  res.success(members);
});

// Generate invite code
router.post("/:id/invite", async (req, res) => {
  await delay(200);

  const household = households.find((h) => h.id === req.params.id);

  if (!household) {
    return res.error("NOT_FOUND", "Household not found", null, 404);
  }

  const newInviteCode = generateInviteCode();
  household.invite_code = newInviteCode;
  household.updated_at = new Date().toISOString();

  res.success(
    {
      invite_code: newInviteCode,
      invite_link: `${process.env.FRONTEND_URL || "http://localhost:3000"}/join/${newInviteCode}`,
      expires_at: null, // Mock: codes don't expire
    },
    "Invite code generated successfully"
  );
});

// Remove member
router.delete("/:id/members/:userId", async (req, res) => {
  await delay(300);

  const memberIndex = householdMembers.findIndex(
    (m) => m.household_id === req.params.id && m.user_id === req.params.userId
  );

  if (memberIndex === -1) {
    return res.error("NOT_FOUND", "Member not found", null, 404);
  }

  householdMembers.splice(memberIndex, 1);

  // Update member count
  const household = households.find((h) => h.id === req.params.id);
  if (household) {
    household.member_count--;
  }

  res.success({ success: true }, "Member removed successfully");
});

// Leave household
router.post("/:id/leave", async (req, res) => {
  await delay(400);

  const { transfer_admin_to } = req.body;

  const memberIndex = householdMembers.findIndex(
    (m) => m.household_id === req.params.id && m.user_id === currentUser.id
  );

  if (memberIndex === -1) {
    return res.error("NOT_FOUND", "You are not a member of this household", null, 404);
  }

  const household = households.find((h) => h.id === req.params.id);

  // If user is admin and there are other members, transfer admin role
  if (household && household.admin_id === currentUser.id && transfer_admin_to) {
    household.admin_id = transfer_admin_to;
    const newAdmin = householdMembers.find((m) => m.household_id === req.params.id && m.user_id === transfer_admin_to);
    if (newAdmin) {
      newAdmin.role = "admin";
    }
  }

  householdMembers.splice(memberIndex, 1);

  if (household) {
    household.member_count--;
  }

  res.success({ success: true }, "Left household successfully");
});

// Get household settings
router.get("/:id/settings", async (req, res) => {
  await delay(100);
  res.success(householdSettings);
});

// Update household settings
router.put("/:id/settings", async (req, res) => {
  await delay(200);

  Object.keys(req.body).forEach((key) => {
    if (req.body[key] !== undefined) {
      householdSettings[key] = req.body[key];
    }
  });

  res.success(householdSettings, "Settings updated successfully");
});

// Get dashboard data
router.get("/:id/dashboard", async (req, res) => {
  await delay(300);

  const dashboardData = generateDashboardData();
  res.success(dashboardData);
});

// Get household balances
router.get("/:id/balances", async (req, res) => {
  await delay(250);

  const balances = generateBalances();
  res.success(balances);
});

// Get specific user balance
router.get("/:id/balances/:userId", async (req, res) => {
  await delay(150);

  const balances = generateBalances();
  const userBalance = balances.member_balances.find((b) => b.user_id === req.params.userId);

  if (!userBalance) {
    return res.error("NOT_FOUND", "User balance not found", null, 404);
  }

  res.success({
    total_owed: userBalance.total_owed,
    total_paid: userBalance.total_paid,
    net_balance: userBalance.net_balance,
  });
});

// Settle balance between users
router.post("/:id/balances/settle", async (req, res) => {
  await delay(500);

  const { from_user_id, to_user_id, amount } = req.body;

  try {
    validateRequired(req.body, ["from_user_id", "to_user_id", "amount"]);
  } catch (error) {
    return res.error("VALIDATION_ERROR", error.message, null, 400);
  }

  // In a real app, this would update the actual balances
  // For mock, we just simulate success
  res.success({ success: true }, `Settlement of ${amount} processed successfully`);
});

// Helper function to generate invite codes
function generateInviteCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default router;
