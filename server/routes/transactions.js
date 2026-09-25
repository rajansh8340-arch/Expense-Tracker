import express from 'express';
import { Transaction, User } from '../models/models.js';
import { seedTransactionsForUser } from '../utils/seedData.js';

const router = express.Router();

// @route   GET /api/transactions
// @desc    Get all transactions for the user with filters and search
router.get('/', async (req, res) => {
  const { search, type, category, month, startDate, endDate, sort = 'newest' } = req.query;
  const filter = { user: req.user.id };

  if (search && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
      { category: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  if (type && (type === 'income' || type === 'expense')) {
    filter.type = type;
  }

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (month) {
    const [year, m] = month.split('-').map(Number);
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 1);
    filter.date = { $gte: start, $lt: end };
  } else if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      filter.date.$lte = e;
    }
  }

  let sortCriteria = { date: -1, createdAt: -1 };
  if (sort === 'oldest') {
    sortCriteria = { date: 1, createdAt: 1 };
  } else if (sort === 'highest') {
    sortCriteria = { amount: -1 };
  } else if (sort === 'lowest') {
    sortCriteria = { amount: 1 };
  }

  const rows = await Transaction.find(filter).sort(sortCriteria).lean();
  res.json(rows);
});

// @route   POST /api/transactions
// @desc    Create a new transaction
router.post('/', async (req, res) => {
  const { title, amount, type, category, date, paymentMethod, description } = req.body;

  if (!title || amount === undefined || !type || !category) {
    return res.status(400).json({ message: 'Title, amount, type, and category are required.' });
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ message: 'Amount must be a valid positive number.' });
  }

  const newTx = await Transaction.create({
    user: req.user.id,
    title: title.trim(),
    amount: parsedAmount,
    type,
    category: category.trim(),
    date: date ? new Date(date) : new Date(),
    paymentMethod: paymentMethod || 'Credit Card',
    description: description ? description.trim() : '',
  });

  res.status(201).json(newTx);
});

// @route   GET /api/transactions/analytics/summary
// @desc    Get aggregate analytics, category totals, monthly trends
router.get('/analytics/summary', async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId).lean();
  const rows = await Transaction.find({ user: userId }).sort({ date: -1 }).lean();

  let income = 0;
  let expenses = 0;
  const byCategory = {};
  const incomeByCategory = {};
  const byPaymentMethod = {};
  const monthsData = {};

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let currentMonthExpense = 0;
  let currentMonthIncome = 0;

  // Initialize last 6 months buckets
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('en-US', { month: 'short' });
    monthsData[key] = { name: key, income: 0, expenses: 0, net: 0 };
  }

  rows.forEach((r) => {
    const amt = Number(r.amount) || 0;
    const txDate = new Date(r.date);
    const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
    const shortMonth = txDate.toLocaleString('en-US', { month: 'short' });

    if (monthKey === currentMonthKey) {
      if (r.type === 'expense') currentMonthExpense += amt;
      else if (r.type === 'income') currentMonthIncome += amt;
    }

    if (r.type === 'income') {
      income += amt;
      incomeByCategory[r.category] = (incomeByCategory[r.category] || 0) + amt;
      if (monthsData[shortMonth]) {
        monthsData[shortMonth].income += amt;
      }
    } else {
      expenses += amt;
      byCategory[r.category] = (byCategory[r.category] || 0) + amt;
      if (monthsData[shortMonth]) {
        monthsData[shortMonth].expenses += amt;
      }
    }

    if (r.paymentMethod) {
      byPaymentMethod[r.paymentMethod] = (byPaymentMethod[r.paymentMethod] || 0) + amt;
    }
  });

  const balance = income - expenses;
  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - expenses) / income) * 100)) : 0;

  // Convert monthly data to array
  const monthlyTrends = Object.values(monthsData).map((m) => ({
    ...m,
    net: m.income - m.expenses,
  }));

  // Simple months object for backwards compatibility
  const simpleMonths = {};
  Object.values(monthsData).forEach((m) => {
    simpleMonths[m.name] = m.expenses;
  });

  res.json({
    income: Math.round(income * 100) / 100,
    expenses: Math.round(expenses * 100) / 100,
    balance: Math.round(balance * 100) / 100,
    savingsRate,
    monthlyBudget: user?.monthlyBudget || 2500,
    currentMonthExpense: Math.round(currentMonthExpense * 100) / 100,
    currentMonthIncome: Math.round(currentMonthIncome * 100) / 100,
    byCategory,
    incomeByCategory,
    byPaymentMethod,
    months: simpleMonths,
    monthlyTrends,
    totalCount: rows.length,
    recent: rows.slice(0, 6),
  });
});

// @route   POST /api/transactions/actions/seed
// @desc    Seed sample transactions for current user
router.post('/actions/seed', async (req, res) => {
  const count = await seedTransactionsForUser(req.user.id);
  res.json({ message: `Successfully added ${count} sample transactions.` });
});

// @route   DELETE /api/transactions/actions/clear-all
// @desc    Clear all transactions for the user
router.delete('/actions/clear-all', async (req, res) => {
  const result = await Transaction.deleteMany({ user: req.user.id });
  res.json({ message: `Cleared ${result.deletedCount} transactions.` });
});

// @route   GET /api/transactions/actions/export
// @desc    Export transactions as CSV
router.get('/actions/export', async (req, res) => {
  const rows = await Transaction.find({ user: req.user.id }).sort({ date: -1 }).lean();
  let csv = 'Date,Title,Type,Category,Amount,PaymentMethod,Description\n';
  rows.forEach((r) => {
    const d = new Date(r.date).toISOString().slice(0, 10);
    const title = `"${(r.title || '').replace(/"/g, '""')}"`;
    const desc = `"${(r.description || '').replace(/"/g, '""')}"`;
    const cat = `"${(r.category || '').replace(/"/g, '""')}"`;
    const pm = `"${(r.paymentMethod || '').replace(/"/g, '""')}"`;
    csv += `${d},${title},${r.type},${cat},${r.amount},${pm},${desc}\n`;
  });

  res.header('Content-Type', 'text/csv');
  res.attachment('ledgerly-transactions.csv');
  res.send(csv);
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction by ID
router.get('/:id', async (req, res) => {
  const row = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
  if (!row) {
    return res.status(404).json({ message: 'Transaction not found.' });
  }
  res.json(row);
});

// @route   PATCH /api/transactions/:id
// @desc    Update a transaction
router.patch('/:id', async (req, res) => {
  const { title, amount, type, category, date, paymentMethod, description } = req.body;
  const updates = {};

  if (title) updates.title = title.trim();
  if (amount !== undefined) updates.amount = Number(amount);
  if (type) updates.type = type;
  if (category) updates.category = category.trim();
  if (date) updates.date = new Date(date);
  if (paymentMethod) updates.paymentMethod = paymentMethod;
  if (description !== undefined) updates.description = description.trim();

  const row = await Transaction.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    updates,
    { new: true, runValidators: true }
  );

  if (!row) {
    return res.status(404).json({ message: 'Transaction not found.' });
  }
  res.json(row);
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
router.delete('/:id', async (req, res) => {
  const row = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!row) {
    return res.status(404).json({ message: 'Transaction not found.' });
  }
  res.json({ message: 'Transaction deleted successfully.' });
});

export default router;
