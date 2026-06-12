const express = require('express');
const router = express.Router();
const { db } = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/payments
// @desc    Get payments for current user (tenant or landlord owner)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    let payments = [];
    if (req.user.isOwner) {
      // Find all leases where owner is this user
      const leases = await db.select('leases', { ownerEmail: req.user.email });
      const leaseIds = leases.map(l => l.id);
      
      // Get all payments and filter
      const allPayments = await db.select('payments');
      payments = allPayments.filter(p => leaseIds.includes(p.leaseId));
    } else {
      payments = await db.select('payments', { tenantId: req.user.id });
    }
    res.json(payments);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payments
// @desc    Record a payment (UPI/Card rent or deposit payment)
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  const { leaseId, amount, type, method } = req.body;

  if (!amount) {
    return res.status(400).json({ message: 'Please enter payment amount' });
  }

  try {
    const newPayment = {
      leaseId: leaseId || 'manual',
      tenantId: req.user.id,
      tenantName: req.user.fullName,
      amount: Number(amount),
      type: type || 'Rent',
      status: 'Paid',
      method: method || 'UPI',
      txHash: 'tx_' + Math.random().toString(36).substr(2, 9),
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const payment = await db.insert('payments', newPayment);
    res.status(201).json(payment);
  } catch (err) {
    console.error('Error recording payment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
