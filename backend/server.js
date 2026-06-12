const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const tenantRoutes = require('./routes/tenants');
const leaseRoutes = require('./routes/leases');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const imagekitRoutes = require('./routes/imagekit');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/leases', leaseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/imagekit', imagekitRoutes);

// GET /health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    supabaseConnected: !!process.env.SUPABASE_URL
  });
});

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'API Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`RentEdge Backend Server running on port ${PORT}`);
});
