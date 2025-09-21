const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
