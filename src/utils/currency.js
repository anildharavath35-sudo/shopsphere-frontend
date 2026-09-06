export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export const formatDate = (date, opts) =>
  new Date(date).toLocaleDateString('en-IN', opts || {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

export const discountPercent = (mrp, price) => {
  if (!mrp || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};