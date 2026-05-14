const toSafeNumber = (value) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
};

export const formatINR = (value, options = {}) => {
  const amount = toSafeNumber(value);
  const fallbackDigits = Number.isInteger(amount) ? 0 : 2;
  const digits = options.maximumFractionDigits ?? fallbackDigits;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: options.minimumFractionDigits ?? digits,
    maximumFractionDigits: digits,
  }).format(amount);
};

export const formatINRCompact = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(toSafeNumber(value));
