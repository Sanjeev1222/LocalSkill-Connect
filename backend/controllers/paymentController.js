const Payment = require('../models/Payment');
const { asyncHandler } = require('../utils/helpers');

const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, type, referenceId, currency = 'inr' } = req.body;

  const demoPaymentIntent = {
    id: `pi_demo_${Date.now()}`,
    client_secret: `pi_demo_${Date.now()}_secret_${Math.random().toString(36).substr(2)}`,
    amount: amount * 100,
    currency,
    status: 'requires_payment_method'
  };

  const payment = await Payment.create({
    user: req.user._id,
    type,
    referenceId,
    amount,
    currency: currency.toUpperCase(),
    method: 'online',
    status: 'processing',
    stripePaymentId: demoPaymentIntent.id
  });

  res.json({
    success: true,
    data: {
      clientSecret: demoPaymentIntent.client_secret,
      paymentId: payment._id
    }
  });
});

const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment not found' });
  }

  payment.status = 'completed';
  await payment.save();

  res.json({ success: true, data: payment });
});

const getPaymentHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const payments = await Payment.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Payment.countDocuments({ user: req.user._id });

  res.json({
    success: true,
    data: payments,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  });
});

module.exports = { createPaymentIntent, confirmPayment, getPaymentHistory };
