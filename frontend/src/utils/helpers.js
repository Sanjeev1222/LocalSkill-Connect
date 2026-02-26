export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    returned: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const skillIcons = {
  'Plumber': '🔧',
  'Electrician': '⚡',
  'Mechanic': '🔩',
  'AC Technician': '❄️',
  'Carpenter': '🪚',
  'Cleaner': '🧹',
  'Painter': '🎨',
  'Engineer': '👷',
  'Appliance Repair': '🔌',
  'Locksmith': '🔑',
  'Welder': '🔥',
  'Mason': '🧱',
  'Pest Control': '🐛',
  'Gardener': '🌱',
  'Interior Designer': '🏠'
};

export const availableSkills = [
  'Plumber', 'Electrician', 'Mechanic', 'AC Technician',
  'Carpenter', 'Cleaner', 'Painter', 'Engineer',
  'Appliance Repair', 'Locksmith', 'Welder', 'Mason',
  'Pest Control', 'Gardener', 'Interior Designer'
];

export const toolCategories = [
  'Power Tools', 'Hand Tools', 'Measuring Tools',
  'Plumbing Tools', 'Electrical Tools', 'Gardening Tools',
  'Painting Tools', 'Cleaning Equipment', 'Construction Equipment',
  'Automotive Tools', 'Welding Equipment', 'Safety Equipment', 'Other'
];

export const validatePhone = (phone) => {
  if (!phone) return { valid: true, message: '' }; // optional field
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10) return { valid: false, message: 'Phone number must be exactly 10 digits (too short)' };
  if (cleaned.length > 10) return { valid: false, message: 'Phone number must be exactly 10 digits (too long)' };
  return { valid: true, message: '', cleaned };
};
