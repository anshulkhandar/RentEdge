const express = require('express');
const router = express.Router();
const { db } = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// Helper to generate a random 6-character alphanumeric code
function generateAccessCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// @route   POST /api/leases/generate-code
// @desc    Generate access code for a property unit
// @access  Private (Owner/Hostel only)
router.post('/generate-code', authMiddleware, async (req, res) => {
  const { propertyId, unitIndex } = req.body;

  if (!propertyId || !unitIndex) {
    return res.status(400).json({ message: 'Please provide propertyId and unitIndex' });
  }

  try {
    const property = await db.selectFirst('properties', { id: propertyId });
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const code = generateAccessCode();
    const newCodeRecord = {
      propertyId,
      propertyTitle: property.title,
      unitIndex: Number(unitIndex),
      code,
      status: 'Awaiting Tenant Entry',
      ownerName: req.user.fullName,
      ownerEmail: req.user.email,
      createdAt: new Date().toISOString()
    };

    // Save access code in a table (e.g. leases or access_codes)
    // We will save it in leases table but with type/status representing code registry
    const lease = await db.insert('leases', newCodeRecord);

    res.json({
      id: lease.id,
      propertyId: lease.propertyId,
      property: lease.propertyTitle,
      unitIndex: lease.unitIndex,
      code: lease.code,
      status: lease.status,
      created: 'Just now'
    });
  } catch (err) {
    console.error('Error generating access code:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leases/verify-code
// @desc    Verify access code entered by tenant and link lease
// @access  Private (Tenant only)
router.post('/verify-code', authMiddleware, async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Please enter access code' });
  }

  try {
    // Check if code is active
    let lease = await db.selectFirst('leases', { code: code.toUpperCase(), status: 'Awaiting Tenant Entry' });

    // Fallback/pre-populated hardcoded codes support for demo compatibility
    if (!lease) {
      const PRE_DEFINED_CODES = {
        '123456': { propertyId: 'prop-4', title: 'HSR Smart Premium Suite', owner: 'Rahul Malhotra' },
        '789012': { propertyId: 'prop-1', title: 'The Edge Residences – Indiranagar', owner: 'Rajvardhan Pawar' },
        '654321': { propertyId: 'prop-3', title: 'Khar Oasis Smart Suite', owner: 'Nisha Mehta' }
      };

      const matchedCode = PRE_DEFINED_CODES[code.toUpperCase()];
      if (matchedCode) {
        // Create a dynamic lease record for this matched code
        lease = await db.insert('leases', {
          propertyId: matchedCode.propertyId,
          propertyTitle: matchedCode.title,
          unitIndex: 1,
          code: code.toUpperCase(),
          status: 'Awaiting Tenant Entry',
          ownerName: matchedCode.owner,
          ownerEmail: 'owner@rentedge.in',
          createdAt: new Date().toISOString()
        });
      }
    }

    if (!lease) {
      return res.status(400).json({ message: 'Invalid or already linked access code' });
    }

    // Get the property details
    const property = await db.selectFirst('properties', { id: lease.propertyId });
    if (!property) {
      return res.status(404).json({ message: 'Property details not found' });
    }

    // Link lease to current tenant user
    const updatedLease = await db.update('leases', lease.id, {
      tenantId: req.user.id,
      tenantName: req.user.fullName,
      tenantEmail: req.user.email,
      status: 'Active',
      linkedAt: new Date().toISOString()
    });

    // Update tenant profile lifecycle state & link property
    const tenant = await db.selectFirst('tenants', { userId: req.user.id });
    if (tenant) {
      await db.update('tenants', tenant.id, {
        selectedPropertyId: property.id,
        lifecycleState: 'BROWSING' // keep compatibility
      });
    }

    res.json({
      lease: updatedLease,
      property: {
        id: property.id,
        title: property.title,
        owner: property.ownerName,
        area: property.location || property.area,
        propertyId: property.id
      }
    });
  } catch (err) {
    console.error('Error verifying access code:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leases/my-leases
// @desc    Get leases for currently logged in tenant or landlord owner
// @access  Private
router.get('/my-leases', authMiddleware, async (req, res) => {
  try {
    let leases = [];
    if (req.user.role === 'owner' || req.user.role === 'hostel') {
      leases = await db.select('leases', { ownerEmail: req.user.email });
    } else {
      leases = await db.select('leases', { tenantId: req.user.id });
    }
    res.json(leases);
  } catch (err) {
    console.error('Error fetching leases:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/leases/:id
// @desc    Revoke/delete an access code or lease
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const lease = await db.selectFirst('leases', { id: req.params.id });
    if (!lease) {
      return res.status(404).json({ message: 'Access code/lease not found' });
    }

    // Allow owner or tenant of this lease to delete
    if (lease.ownerEmail !== req.user.email && lease.tenantId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.delete('leases', req.params.id);
    res.json({ message: 'Access code or lease revoked successfully' });
  } catch (err) {
    console.error('Error revoking lease:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
