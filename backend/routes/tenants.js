const express = require('express');
const router = express.Router();
const { db } = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/tenants/me
// @desc    Get current tenant profile
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    let tenant = await db.selectFirst('tenants', { userId: req.user.id });
    
    // Auto-create tenant profile if it doesn't exist
    if (!tenant) {
      tenant = await db.insert('tenants', {
        userId: req.user.id,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone || '',
        rentScore: 710, // default good starting credit rent score
        lifecycleState: 'BROWSING',
        selectedPropertyId: null,
        createdAt: new Date().toISOString()
      });
    }
    
    res.json(tenant);
  } catch (err) {
    console.error('Error fetching tenant profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tenants/profile
// @desc    Update tenant profile details (rent score, selected property, etc.)
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    let tenant = await db.selectFirst('tenants', { userId: req.user.id });
    if (!tenant) {
      tenant = await db.insert('tenants', {
        userId: req.user.id,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone || '',
        rentScore: 710,
        lifecycleState: 'BROWSING',
        selectedPropertyId: null,
        createdAt: new Date().toISOString()
      });
    }

    const updated = await db.update('tenants', tenant.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error('Error updating tenant profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tenants
// @desc    Get all tenants (for dashboard / admin / landlords)
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tenants = await db.select('tenants');
    res.json(tenants);
  } catch (err) {
    console.error('Error fetching tenants list:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
