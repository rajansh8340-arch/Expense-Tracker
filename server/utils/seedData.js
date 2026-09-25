import { Transaction } from '../models/models.js';

export const getSampleTransactions = (userId) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const getDate = (monthOffset, day) => {
    const d = new Date(currentYear, currentMonth + monthOffset, day, 12, 0, 0);
    return d;
  };

  return [
    // Current Month Transactions
    {
      user: userId,
      title: 'Monthly Salary',
      amount: 4850,
      type: 'income',
      category: 'Salary',
      date: getDate(0, 1),
      paymentMethod: 'Bank Transfer',
      description: 'Primary software engineering direct deposit',
    },
    {
      user: userId,
      title: 'Apartment Rent',
      amount: 1450,
      type: 'expense',
      category: 'Housing & Rent',
      date: getDate(0, 2),
      paymentMethod: 'Bank Transfer',
      description: 'Monthly flat rent including maintenance',
    },
    {
      user: userId,
      title: 'Organic Supermarket',
      amount: 142.80,
      type: 'expense',
      category: 'Food & Dining',
      date: getDate(0, 4),
      paymentMethod: 'Credit Card',
      description: 'Weekly fresh fruits, veggies, and groceries',
    },
    {
      user: userId,
      title: 'Freelance Design Sprint',
      amount: 950,
      type: 'income',
      category: 'Freelance',
      date: getDate(0, 6),
      paymentMethod: 'UPI / Digital Wallet',
      description: 'Mobile app UI redesign client milestone',
    },
    {
      user: userId,
      title: 'High-speed Fiber Internet',
      amount: 65,
      type: 'expense',
      category: 'Utilities',
      date: getDate(0, 8),
      paymentMethod: 'Debit Card',
      description: 'Gigabit fiber connection monthly fee',
    },
    {
      user: userId,
      title: 'Gym & Fitness Membership',
      amount: 55,
      type: 'expense',
      category: 'Health & Wellness',
      date: getDate(0, 10),
      paymentMethod: 'Credit Card',
      description: 'Monthly fitness center subscription',
    },
    {
      user: userId,
      title: 'Dinner at Bistro Moderne',
      amount: 88.50,
      type: 'expense',
      category: 'Food & Dining',
      date: getDate(0, 12),
      paymentMethod: 'Credit Card',
      description: 'Weekend dinner with close colleagues',
    },
    {
      user: userId,
      title: 'Streaming & Cloud Services',
      amount: 38.99,
      type: 'expense',
      category: 'Entertainment',
      date: getDate(0, 14),
      paymentMethod: 'Credit Card',
      description: 'Netflix, Spotify & GitHub Pro bundles',
    },
    {
      user: userId,
      title: 'Urban Transit & Metro Pass',
      amount: 72,
      type: 'expense',
      category: 'Transportation',
      date: getDate(0, 17),
      paymentMethod: 'Debit Card',
      description: 'Monthly subway & bus pass reload',
    },
    {
      user: userId,
      title: 'New Wireless Headphones',
      amount: 199.99,
      type: 'expense',
      category: 'Shopping',
      date: getDate(0, 19),
      paymentMethod: 'Credit Card',
      description: 'Active noise cancelling headphones for desk work',
    },
    {
      user: userId,
      title: 'Stock Dividend Yield',
      amount: 215.40,
      type: 'income',
      category: 'Investments',
      date: getDate(0, 20),
      paymentMethod: 'Bank Transfer',
      description: 'Quarterly index fund dividend payout',
    },
    {
      user: userId,
      title: 'Pharmacy & Vitamins',
      amount: 44.50,
      type: 'expense',
      category: 'Health & Wellness',
      date: getDate(0, 22),
      paymentMethod: 'Debit Card',
      description: 'Prescriptions and daily vitamins restock',
    },

    // Previous Month Transactions
    {
      user: userId,
      title: 'Monthly Salary',
      amount: 4850,
      type: 'income',
      category: 'Salary',
      date: getDate(-1, 1),
      paymentMethod: 'Bank Transfer',
      description: 'Primary paycheck deposit',
    },
    {
      user: userId,
      title: 'Apartment Rent',
      amount: 1450,
      type: 'expense',
      category: 'Housing & Rent',
      date: getDate(-1, 2),
      paymentMethod: 'Bank Transfer',
      description: 'Rent payment',
    },
    {
      user: userId,
      title: 'Grocery Supplies',
      amount: 320.15,
      type: 'expense',
      category: 'Food & Dining',
      date: getDate(-1, 9),
      paymentMethod: 'Debit Card',
      description: 'Monthly supermarket run',
    },
    {
      user: userId,
      title: 'Weekend Getaway Airfare',
      amount: 280,
      type: 'expense',
      category: 'Travel',
      date: getDate(-1, 15),
      paymentMethod: 'Credit Card',
      description: 'Round-trip flight ticket',
    },
    {
      user: userId,
      title: 'Web Consultation Side Gig',
      amount: 600,
      type: 'income',
      category: 'Freelance',
      date: getDate(-1, 20),
      paymentMethod: 'UPI / Digital Wallet',
      description: 'Frontend performance audit consulting',
    },

    // 2 Months Ago
    {
      user: userId,
      title: 'Monthly Salary',
      amount: 4850,
      type: 'income',
      category: 'Salary',
      date: getDate(-2, 1),
      paymentMethod: 'Bank Transfer',
      description: 'Direct salary deposit',
    },
    {
      user: userId,
      title: 'Apartment Rent',
      amount: 1450,
      type: 'expense',
      category: 'Housing & Rent',
      date: getDate(-2, 2),
      paymentMethod: 'Bank Transfer',
      description: 'Rent payment',
    },
    {
      user: userId,
      title: 'Car Maintenance & Oil Change',
      amount: 185,
      type: 'expense',
      category: 'Transportation',
      date: getDate(-2, 18),
      paymentMethod: 'Credit Card',
      description: 'Annual service check and oil renewal',
    },
  ];
};

export const seedTransactionsForUser = async (userId) => {
  const samples = getSampleTransactions(userId);
  await Transaction.insertMany(samples);
  return samples.length;
};
