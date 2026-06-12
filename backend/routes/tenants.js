const express = require('express');
const router = express.Router();
const { db, supabase } = require('../config/supabase');
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

// @route   POST /api/tenants/join-property
// @desc    Tenant requests to join a property via code
// @access  Private
router.post('/join-property', authMiddleware, async (req, res) => {
  const { propertyCode } = req.body;
  if (!propertyCode) {
    return res.status(400).json({ message: 'Property code is required.' });
  }

  try {
    // 1. Find the property by code
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id, owner_id')
      .eq('property_code', propertyCode.trim())
      .maybeSingle();

    if (propError || !property) {
      return res.status(404).json({ message: 'Invalid property code. Property not found.' });
    }

    // 2. Check if already a tenant
    const { data: activeTenancy } = await supabase
      .from('property_tenants')
      .select('id, status')
      .eq('tenant_id', req.user.id)
      .eq('property_id', property.id)
      .eq('status', 'active')
      .maybeSingle();

    if (activeTenancy) {
      return res.status(400).json({ message: 'You are already an active tenant of this property.' });
    }

    // 3. Check if request already exists
    const { data: existingReq, error: existingError } = await supabase
      .from('property_join_requests')
      .select('id, status')
      .eq('tenant_id', req.user.id)
      .eq('property_id', property.id)
      .maybeSingle();

    if (existingReq) {
      return res.status(400).json({ message: `You have already requested to join this property. Status: ${existingReq.status}` });
    }

    // 3. Create request
    const { data: joinReq, error: joinError } = await supabase
      .from('property_join_requests')
      .insert({
        tenant_id: req.user.id,
        property_id: property.id,
        owner_id: property.owner_id,
        status: 'pending'
      })
      .select()
      .single();

    if (joinError) {
      console.error('Error creating join request:', joinError);
      return res.status(500).json({ message: 'Failed to submit join request.' });
    }

    res.status(201).json({ message: 'Join request submitted successfully.', data: joinReq });
  } catch (err) {
    console.error('Server error during join-property:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tenants/my-properties
// @desc    Get properties the tenant is linked to
// @access  Private
router.get('/my-properties', authMiddleware, async (req, res) => {
  try {
    const { data: tenancies, error } = await supabase
      .from('property_tenants')
      .select(`
        id,
        status,
        joined_at,
        properties (
          *,
          users!properties_owner_id_fkey (full_name, phone, email)
        )
      `)
      .eq('tenant_id', req.user.id)
      .eq('status', 'active');

    if (error) throw error;
    
    // Map it to return a clean list of properties, possibly including tenancy info
    // Similar to the /api/properties structure
    const properties = tenancies.map(t => {
      let p = t.properties;
      p.tenancy_id = t.id;
      p.joined_at = t.joined_at;
      if (p.users) {
        p.owner_name = p.users.full_name;
        p.owner_phone = p.users.phone;
        p.owner_email = p.users.email;
        delete p.users;
      }
      return p;
    });

    // We also need to fetch images, contacts, and payment info for these properties
    for (let prop of properties) {
      prop.images = await db.select('property_images', { property_id: prop.id }, { column: 'display_order', ascending: true });
      prop.contacts = await db.select('property_contacts', { property_id: prop.id });
      prop.payment_info = await db.selectFirst('owner_payment_info', { user_id: prop.owner_id });
    }

    res.json(properties);
  } catch (err) {
    console.error('Error fetching my-properties:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
