const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth');

// @desc    Get all budget goals for the logged-in user
// @route   GET /api/budgets
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.json({ success: true, count: budgets.length, data: budgets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Add a new budget goal
// @route   POST /api/budgets
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { category, limit, icon } = req.body;

    if (!category || !limit) {
      return res.status(400).json({ success: false, error: 'Please enter category and limit' });
    }

    // Check if user already has a budget for this category
    const existingBudget = await Budget.findOne({ userId: req.user.id, category });
    if (existingBudget) {
      return res.status(400).json({
        success: false,
        error: 'A budget goal for this category already exists. Edit it instead.',
      });
    }

    const budget = await Budget.create({
      userId: req.user.id,
      category,
      limit,
      icon,
    });

    res.status(201).json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Update a budget goal limit
// @route   PUT /api/budgets/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ success: false, error: 'Budget goal not found' });
    }

    // Ensure user owns the budget goal
    if (budget.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to edit this budget goal' });
    }

    const { limit, category, icon } = req.body;

    // If changing category, check for duplicates
    if (category && category !== budget.category) {
      const existingBudget = await Budget.findOne({ userId: req.user.id, category });
      if (existingBudget) {
        return res.status(400).json({
          success: false,
          error: 'A budget goal for this category already exists.',
        });
      }
      budget.category = category;
    }

    budget.limit = limit !== undefined ? limit : budget.limit;
    budget.icon = icon || budget.icon;

    await budget.save();

    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Delete a budget goal
// @route   DELETE /api/budgets/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ success: false, error: 'Budget goal not found' });
    }

    // Ensure user owns the budget goal
    if (budget.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to remove this budget goal' });
    }

    await budget.deleteOne();

    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
