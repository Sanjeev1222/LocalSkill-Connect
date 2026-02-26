const User = require('../models/User');
const Technician = require('../models/Technician');
const ToolOwner = require('../models/ToolOwner');
const Tool = require('../models/Tool');
const Booking = require('../models/Booking');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const { asyncHandler } = require('../utils/helpers');

const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalTechnicians,
    totalToolOwners,
    totalTools,
    totalBookings,
    totalRentals,
    completedBookings,
    completedRentals
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Technician.countDocuments(),
    ToolOwner.countDocuments(),
    Tool.countDocuments(),
    Booking.countDocuments(),
    Rental.countDocuments(),
    Booking.countDocuments({ status: 'completed' }),
    Rental.countDocuments({ status: 'returned' })
  ]);

  const bookingRevenue = await Payment.aggregate([
    { $match: { type: 'booking', status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const rentalRevenue = await Payment.aggregate([
    { $match: { type: 'rental', status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyBookings = await Booking.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const monthlyRevenue = await Payment.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo }, status: 'completed' } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        total: { $sum: '$amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const recentBookings = await Booking.find()
    .populate('user', 'name')
    .populate({ path: 'technician', populate: { path: 'user', select: 'name' } })
    .sort({ createdAt: -1 })
    .limit(5);

  const recentUsers = await User.find()
    .select('name email role createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalTechnicians,
        totalToolOwners,
        totalTools,
        totalBookings,
        totalRentals,
        completedBookings,
        completedRentals,
        bookingRevenue: bookingRevenue[0]?.total || 0,
        rentalRevenue: rentalRevenue[0]?.total || 0,
        totalRevenue: (bookingRevenue[0]?.total || 0) + (rentalRevenue[0]?.total || 0)
      },
      monthlyBookings,
      monthlyRevenue,
      recentBookings,
      recentUsers
    }
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  let query = {};

  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: users,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  });
});

const toggleBan = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.isBanned = !user.isBanned;
  await user.save();

  res.json({
    success: true,
    data: { isBanned: user.isBanned },
    message: user.isBanned ? 'User has been banned' : 'User has been unbanned'
  });
});

const verifyTechnician = asyncHandler(async (req, res) => {
  const technician = await Technician.findById(req.params.id);
  if (!technician) {
    return res.status(404).json({ success: false, message: 'Technician not found' });
  }

  technician.isVerified = !technician.isVerified;
  await technician.save();

  res.json({
    success: true,
    data: { isVerified: technician.isVerified }
  });
});

const getAllTechnicians = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const technicians = await Technician.find()
    .populate('user', 'name email phone location isBanned')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Technician.countDocuments();

  res.json({
    success: true,
    data: technicians,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  });
});

const getAllTools = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const tools = await Tool.find()
    .populate({ path: 'owner', populate: { path: 'user', select: 'name email' } })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Tool.countDocuments();

  res.json({
    success: true,
    data: tools,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  });
});

const deleteTool = asyncHandler(async (req, res) => {
  const tool = await Tool.findById(req.params.id);
  if (!tool) {
    return res.status(404).json({ success: false, message: 'Tool not found' });
  }
  await tool.deleteOne();
  res.json({ success: true, message: 'Tool removed by admin' });
});

module.exports = {
  getDashboard,
  getUsers,
  toggleBan,
  verifyTechnician,
  getAllTechnicians,
  getAllTools,
  deleteTool
};
