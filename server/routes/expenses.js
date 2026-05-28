const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// @desc    Get all transactions for the logged-in user
// @route   GET /api/expenses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Add a new transaction
// @route   POST /api/expenses
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { type, amount, category, description, date, icon, note } = req.body;

    if (!type || !amount || !category || !description || !date) {
      return res.status(400).json({ success: false, error: 'Please enter all required fields' });
    }

    const expense = await Expense.create({
      userId: req.user.id,
      type,
      amount,
      category,
      description,
      date,
      icon,
      note,
    });

    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Update a transaction
// @route   PUT /api/expenses/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // Ensure user owns the transaction
    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to edit this transaction' });
    }

    const { type, amount, category, description, date, icon, note } = req.body;

    expense.type = type || expense.type;
    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.category = category || expense.category;
    expense.description = description || expense.description;
    expense.date = date || expense.date;
    expense.icon = icon || expense.icon;
    expense.note = note !== undefined ? note : expense.note;

    await expense.save();

    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Delete a transaction
// @route   DELETE /api/expenses/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    // Ensure user owns the transaction
    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this transaction' });
    }

    await expense.deleteOne();

    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
