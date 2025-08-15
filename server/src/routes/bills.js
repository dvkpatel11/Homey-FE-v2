/**
 * Bill Routes  
 * Handles bill management, payments, and balance tracking
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  bills, 
  householdMembers, 
  currentUser,
  generateBalances
} from '../data/mockData.js';
import { 
  delay, 
  paginate, 
  filterItems, 
  sortItems, 
  validateRequired,
  simulateFileUpload 
} from '../utils/helpers.js';

const router = express.Router();

// Get bills for household
router.get('/', async (req, res) => {
  await delay(200);
  
  const { householdId } = req.params;
  const { 
    page = 1, 
    limit = 50, 
    status, 
    paid_by, 
    category, 
    amount_min, 
    amount_max,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;
  
  // Filter bills by household
  let householdBills = bills.filter(b => b.household_id === householdId);
  
  // Apply filters
  const filters = { status, paid_by, category, amount_min, amount_max };
  householdBills = filterItems(householdBills, filters);
  
  // Sort bills
  householdBills = sortItems(householdBills, sort_by, sort_order);
  
  // Paginate
  const paginatedResult = paginate(householdBills, page, limit);
  
  res.success(paginatedResult);
});

// Create new bill
router.post('/', async (req, res) => {
  await delay(500);
  
  const { householdId } = req.params;
  const { 
    title, 
    description, 
    total_amount, 
    currency = 'USD', 
    due_date, 
    is_recurring = false, 
    recurrence_pattern,
    category,
    splits
  } = req.body;
  
  try {
    validateRequired(req.body, ['title', 'total_amount', 'due_date', 'splits']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (!Array.isArray(splits) || splits.length === 0) {
    return res.error('VALIDATION_ERROR', 'At least one bill split is required', null, 400);
  }
  
  // Validate splits
  const hasPercentages = splits.some(s => s.percentage !== undefined);
  const hasAmounts = splits.some(s => s.amount_owed !== undefined);
  
  if (hasPercentages && hasAmounts) {
    return res.error('VALIDATION_ERROR', 'Cannot mix percentage and amount-based splits', null, 400);
  }
  
  const newBill = {
    id: uuidv4(),
    household_id: householdId,
    title,
    description: description || null,
    total_amount: parseFloat(total_amount).toFixed(2),
    currency,
    due_date,
    paid_date: null,
    is_recurring,
    recurrence_pattern: recurrence_pattern || null,
    category: category || null,
    status: 'pending',
    paid_by: currentUser.id,
    paid_by_name: currentUser.full_name,
    created_by: currentUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    splits: [],
  };
  
  // Create splits
  newBill.splits = splits.map(split => {
    const member = householdMembers.find(m => m.user_id === split.user_id);
    return {
      id: uuidv4(),
      user_id: split.user_id,
      user_name: member?.full_name || 'Unknown User',
      amount_owed: split.amount_owed || '0.00',
      percentage: split.percentage || null,
      paid_amount: '0.00',
      paid_date: null,
    };
  });
  
  bills.push(newBill);
  
  res.success(newBill, 'Bill created successfully');
});

// Get specific bill
router.get('/:id', async (req, res) => {
  await delay(100);
  
  const bill = bills.find(b => b.id === req.params.id);
  
  if (!bill) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  res.success(bill);
});

// Update bill
router.put('/:id', async (req, res) => {
  await delay(300);
  
  const billIndex = bills.findIndex(b => b.id === req.params.id);
  
  if (billIndex === -1) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  const bill = bills[billIndex];
  
  // Update fields
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined && key !== 'id') {
      bill[key] = req.body[key];
    }
  });
  
  bill.updated_at = new Date().toISOString();
  
  res.success(bill, 'Bill updated successfully');
});

// Delete bill
router.delete('/:id', async (req, res) => {
  await delay(200);
  
  const billIndex = bills.findIndex(b => b.id === req.params.id);
  
  if (billIndex === -1) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  bills.splice(billIndex, 1);
  
  res.success({ success: true }, 'Bill deleted successfully');
});

// Get bill splits
router.get('/:id/splits', async (req, res) => {
  await delay(100);
  
  const bill = bills.find(b => b.id === req.params.id);
  
  if (!bill) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  res.success(bill.splits);
});

// Update bill splits
router.put('/:id/split', async (req, res) => {
  await delay(300);
  
  const { splits } = req.body;
  
  if (!Array.isArray(splits)) {
    return res.error('VALIDATION_ERROR', 'splits array is required', null, 400);
  }
  
  const bill = bills.find(b => b.id === req.params.id);
  
  if (!bill) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  // Update splits
  bill.splits = splits.map(split => {
    const existingSplit = bill.splits.find(s => s.user_id === split.user_id);
    const member = householdMembers.find(m => m.user_id === split.user_id);
    
    return {
      id: existingSplit?.id || uuidv4(),
      user_id: split.user_id,
      user_name: member?.full_name || 'Unknown User',
      amount_owed: split.amount_owed || existingSplit?.amount_owed || '0.00',
      percentage: split.percentage || existingSplit?.percentage || null,
      paid_amount: existingSplit?.paid_amount || '0.00',
      paid_date: existingSplit?.paid_date || null,
    };
  });
  
  bill.updated_at = new Date().toISOString();
  
  res.success(bill.splits, 'Bill splits updated successfully');
});

// Record payment for bill split
router.post('/splits/:splitId/payment', async (req, res) => {
  await delay(400);
  
  const { amount, paid_date } = req.body;
  
  try {
    validateRequired(req.body, ['amount']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  // Find the split across all bills
  let foundSplit = null;
  let foundBill = null;
  
  for (const bill of bills) {
    const split = bill.splits.find(s => s.id === req.params.splitId);
    if (split) {
      foundSplit = split;
      foundBill = bill;
      break;
    }
  }
  
  if (!foundSplit) {
    return res.error('NOT_FOUND', 'Bill split not found', null, 404);
  }
  
  const paymentAmount = parseFloat(amount);
  const currentPaid = parseFloat(foundSplit.paid_amount);
  const newPaidAmount = currentPaid + paymentAmount;
  const amountOwed = parseFloat(foundSplit.amount_owed);
  
  foundSplit.paid_amount = newPaidAmount.toFixed(2);
  foundSplit.paid_date = paid_date || new Date().toISOString();
  
  // Update bill status if fully paid
  const allSplitsPaid = foundBill.splits.every(split => 
    parseFloat(split.paid_amount) >= parseFloat(split.amount_owed)
  );
  
  if (allSplitsPaid) {
    foundBill.status = 'paid';
    foundBill.paid_date = new Date().toISOString().split('T')[0];
  }
  
  foundBill.updated_at = new Date().toISOString();
  
  res.success({
    split_id: foundSplit.id,
    amount_paid: paymentAmount.toFixed(2),
    paid_date: foundSplit.paid_date,
    remaining_balance: Math.max(0, amountOwed - newPaidAmount).toFixed(2),
  }, 'Payment recorded successfully');
});

// Upload receipt for bill
router.post('/:id/receipt', async (req, res) => {
  await delay(1000); // Simulate file upload
  
  const bill = bills.find(b => b.id === req.params.id);
  
  if (!bill) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  // Simulate file upload
  const uploadResult = simulateFileUpload({
    originalname: 'receipt.pdf',
    size: 512000,
    mimetype: 'application/pdf'
  });
  
  bill.receipt_url = uploadResult.url;
  bill.updated_at = new Date().toISOString();
  
  res.success({ 
    receipt_url: uploadResult.url 
  }, 'Receipt uploaded successfully');
});

// Get payment history for bill
router.get('/:id/payments', async (req, res) => {
  await delay(150);
  
  const bill = bills.find(b => b.id === req.params.id);
  
  if (!bill) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  const payments = bill.splits
    .filter(split => split.paid_date)
    .map(split => ({
      id: uuidv4(),
      user_name: split.user_name,
      amount: split.paid_amount,
      paid_date: split.paid_date,
      payment_method: 'Mock Payment',
    }))
    .sort((a, b) => new Date(b.paid_date) - new Date(a.paid_date));
  
  res.success(payments);
});

// Bulk operations
router.post('/bulk-mark-paid', async (req, res) => {
  await delay(500);
  
  const { bill_ids } = req.body;
  
  if (!bill_ids || !Array.isArray(bill_ids)) {
    return res.error('VALIDATION_ERROR', 'bill_ids array is required', null, 400);
  }
  
  let marked_count = 0;
  
  bill_ids.forEach(billId => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      bill.status = 'paid';
      bill.paid_date = new Date().toISOString().split('T')[0];
      bill.updated_at = new Date().toISOString();
      
      // Mark all splits as paid
      bill.splits.forEach(split => {
        split.paid_amount = split.amount_owed;
        split.paid_date = new Date().toISOString();
      });
      
      marked_count++;
    }
  });
  
  res.success({ 
    success: true, 
    marked_count 
  }, `${marked_count} bills marked as paid`);
});

router.post('/bulk-delete', async (req, res) => {
  await delay(300);
  
  const { bill_ids } = req.body;
  
  if (!bill_ids || !Array.isArray(bill_ids)) {
    return res.error('VALIDATION_ERROR', 'bill_ids array is required', null, 400);
  }
  
  let deleted_count = 0;
  
  // Remove bills in reverse order to maintain indices
  for (let i = bills.length - 1; i >= 0; i--) {
    if (bill_ids.includes(bills[i].id)) {
      bills.splice(i, 1);
      deleted_count++;
    }
  }
  
  res.success({ 
    success: true, 
    deleted_count 
  }, `${deleted_count} bills deleted`);
});

// Bill statistics
router.get('/statistics', async (req, res) => {
  await delay(250);
  
  const { householdId } = req.params;
  const { period = 'month' } = req.query;
  
  const householdBills = bills.filter(b => b.household_id === householdId);
  
  const totalAmount = householdBills.reduce((sum, bill) => sum + parseFloat(bill.total_amount), 0);
  const paidAmount = householdBills
    .filter(b => b.status === 'paid')
    .reduce((sum, bill) => sum + parseFloat(bill.total_amount), 0);
  
  const categoryBreakdown = householdBills.reduce((acc, bill) => {
    const category = bill.category || 'other';
    acc[category] = (parseFloat(acc[category]) || 0) + parseFloat(bill.total_amount);
    return acc;
  }, {});
  
  // Convert to strings for consistency
  Object.keys(categoryBreakdown).forEach(key => {
    categoryBreakdown[key] = categoryBreakdown[key].toFixed(2);
  });
  
  res.success({
    total_bills: householdBills.length,
    total_amount: totalAmount.toFixed(2),
    paid_amount: paidAmount.toFixed(2),
    outstanding_amount: (totalAmount - paidAmount).toFixed(2),
    average_bill_amount: householdBills.length > 0 ? (totalAmount / householdBills.length).toFixed(2) : '0.00',
    category_breakdown: categoryBreakdown,
    payment_trends: [
      { month: 'January', amount: '450.00' },
      { month: 'February', amount: '523.50' },
      { month: 'March', amount: '489.75' },
    ],
  });
});

export default router;
