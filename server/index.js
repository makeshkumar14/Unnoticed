const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database connection
const database = require('./utils/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const childrenRoutes = require('./routes/children');
const healthRoutes = require('./routes/health');
const remindersRoutes = require('./routes/reminders');
const carePlansRoutes = require('./routes/carePlans');
const aiRoutes = require('./routes/ai');

// Routes
app.use('/api/children', childrenRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/care-plans', carePlansRoutes);
app.use('/api/ai', aiRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Copilot for Parents API is running' });
});

// Start server and connect to database
async function startServer() {
  try {
    // Connect to MongoDB
    await database.connect();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Database: ${database.getConnectionStatus() ? 'Connected' : 'Disconnected'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  await database.disconnect();
  process.exit(0);
});

startServer();
