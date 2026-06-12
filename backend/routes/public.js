const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// @route   GET /api/public/properties
// @desc    Get paginated, filtered properties for public discovery
// @access  Public
router.get('/properties', async (req, res) => {
  try {
    let { 
      q, 
      city, 
      property_type, 
      bhk, 
      min_rent, 
      max_rent, 
      occupancy_type,
      furnishing,
      limit = 20, 
      offset = 0 
    } = req.query;

    limit = parseInt(limit);
    offset = parseInt(offset);

    // Start query
    let query = supabase
      .from('properties')
      .select(`
        *,
        property_images (*),
        property_tags (*),
        property_amenities (*),
        property_details (details)
      `, { count: 'exact' })
      .eq('status', 'active');

    // Apply text search (using ilike on multiple columns for reliability)
    if (q) {
      query = query.or(`property_name.ilike.%${q}%,city.ilike.%${q}%,locality.ilike.%${q}%,short_description.ilike.%${q}%`);
    }

    if (city && city !== 'All') {
      query = query.ilike('city', `%${city}%`);
    }

    if (property_type && property_type !== 'All') {
      const types = property_type.split(',').map(t => t.trim());
      query = query.in('property_type', types);
    }

    if (occupancy_type && occupancy_type !== 'Any') {
      query = query.eq('occupancy_type', occupancy_type);
    }

    if (min_rent) {
      query = query.gte('rent_amount', parseInt(min_rent));
    }

    if (max_rent) {
      query = query.lte('rent_amount', parseInt(max_rent));
    }

    // JSONB filtering for BHK using Contains operator
    // Or we filter post-fetch if it's too complex for Supabase JS API.
    // In Supabase JS, you can query JSONB: .contains('column', '{"key": "value"}')
    // Wait, property_details is a joined table, we can't easily filter by it directly in select using Supabase JS unless we use inner joins.
    // Let's use foreign table filtering:
    // query = query.eq('property_details.details->>bhk', bhk) -- Not supported in standard supabase-js without postgrest advanced features.
    
    // So for bhk, if it's provided, we will do a separate query or filter in memory if the limit is small, but that breaks pagination.
    // Actually, postgrest supports: !inner on the join.
    if (bhk && bhk !== 'Any') {
      // Need to adjust the select to do inner join
      query = supabase
        .from('properties')
        .select(`
          *,
          property_images (*),
          property_tags (*),
          property_amenities (*),
          property_details!inner (details)
        `, { count: 'exact' })
        .eq('status', 'active');
        
      // Re-apply previous filters since we re-assigned query
      if (q) {
        query = query.or(`property_name.ilike.%${q}%,city.ilike.%${q}%,locality.ilike.%${q}%,short_description.ilike.%${q}%`);
      }
      if (city && city !== 'All') query = query.ilike('city', `%${city}%`);
      if (property_type && property_type !== 'All') {
        const types = property_type.split(',').map(t => t.trim());
        query = query.in('property_type', types);
      }
      if (occupancy_type && occupancy_type !== 'Any') query = query.eq('occupancy_type', occupancy_type);
      if (min_rent) query = query.gte('rent_amount', parseInt(min_rent));
      if (max_rent) query = query.lte('rent_amount', parseInt(max_rent));

      if (bhk === '3+') {
        query = query.gte('property_details.details->>bhk', 3);
      } else {
        query = query.eq('property_details.details->>bhk', bhk);
      }
    }

    // Apply Sorting: newest first
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching public properties:', error);
      return res.status(500).json({ message: 'Error fetching properties', error: error.message });
    }

    // Map data to expected format for frontend
    const mappedProperties = data.map(prop => {
      // The join returns arrays for relations
      const details = prop.property_details && prop.property_details.length > 0 ? prop.property_details[0].details : (prop.property_details?.details || {});
      
      // Order images by display_order
      const images = (prop.property_images || []).sort((a, b) => a.display_order - b.display_order);

      return {
        id: prop.id,
        title: prop.property_name,
        type: prop.property_type,
        city: prop.city,
        area: prop.locality || prop.city,
        price: prop.rent_amount,
        rent: prop.rent_amount, // compatibility
        deposit: prop.deposit_amount || 0, // compatibility
        depositMonths: (prop.rent_amount && prop.deposit_amount) ? Math.round(prop.deposit_amount / prop.rent_amount) : 0,
        rentScoreRequired: 0, // compatibility
        beds: details.bhk ? parseInt(details.bhk) : 1, // compatibility
        bhk: details.bhk ? parseInt(details.bhk) : 1,
        baths: details.bathrooms ? parseInt(details.bathrooms) : 1,
        sqft: details.built_up_area || details.carpet_area || details.commercial_area || 0,
        images: images.length > 0 ? images.map(img => img.image_url) : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80'],
        image: images.length > 0 ? images[0].image_url : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80', // compatibility - singular
        location: `${prop.locality || ''}, ${prop.city}`, // compatibility
        amenities: (prop.property_amenities || []).map(a => a.amenity_name),
        tags: (prop.property_tags || []).map(t => t.tag_name),
        tag: 'Verified',
        description: prop.short_description || prop.full_description || '',
        ownerName: 'Verified Landlord',
        ownerPhoneMasked: '+91 98XXX XXXXX',
        ownerPhoneFull: '+91 98765 43210',
        details: details,
        property_type: prop.property_type,
        occupancy_type: prop.occupancy_type,
        is_city_pioneer: prop.is_city_pioneer || false
      };
    });

    res.json({
      properties: mappedProperties,
      totalCount: count,
      hasMore: offset + limit < count
    });
  } catch (err) {
    console.error('Server error in public properties:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
