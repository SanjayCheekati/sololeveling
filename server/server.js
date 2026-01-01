const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const problemRoutes = require('./routes/problems');
const progressRoutes = require('./routes/progress');
const executionRoutes = require('./routes/execution');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with Memory Server fallback
const connectDB = async () => {
  try {
    // Try connecting to configured MongoDB first
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[SYSTEM] Database connection established');
  } catch (err) {
    console.log('[SYSTEM] Local MongoDB not found, starting in-memory database...');
    // Start in-memory MongoDB
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('[SYSTEM] In-memory database connection established');
    
    // Auto-seed the database
    console.log('[SYSTEM] Seeding database with problems...');
    const seedProblems = require('./seeds/seedProblems');
    await seedProblems();
    console.log('[SYSTEM] Database seeding complete!');
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/execute', executionRoutes);

// System Status Route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: '[SYSTEM] Solo Leveling × DSA Server Active',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[SYSTEM ERROR]', err.stack);
  res.status(500).json({
    success: false,
    message: '[SYSTEM] Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '[SYSTEM] Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════════╗
  ║     SOLO LEVELING × DSA - SYSTEM INITIALIZED       ║
  ╠════════════════════════════════════════════════════╣
  ║  Server running on port ${PORT}                        ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}                       ║
  ║  Status: ONLINE                                    ║
  ╚════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
