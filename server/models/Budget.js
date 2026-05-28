const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
  },
  limit: {
    type: Number,
    required: [true, 'Please add a monthly limit'],
    min: [1, 'Limit must be at least 1'],
  },
  icon: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Enforce compound index so a user cannot create multiple budgets for the same category
BudgetSchema.index({ userId: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
