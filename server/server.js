const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budgets');

// Route Middlewares
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Finance Manager API is running smoothly.' });
});

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the Finance & Expense Manager API');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Server Error' });
});

// Define Port
const PORT = process.env.PORT || 5000;

// Connect to MongoDB & Start Server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas! 🎉');
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} 🚀`);
      });
    }
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
  });

module.exports = app;
