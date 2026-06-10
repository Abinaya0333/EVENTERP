export function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

export function formatCurrency(value) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function getSanctionerLevel(profile) {
  const email = String(profile?.email || '').toLowerCase();
  if (email.includes('hod@')) return 'HOD';
  if (email.includes('dean@')) return 'DEAN';
  if (email.includes('principal@')) return 'PRINCIPAL';
  return 'SANCTIONER';
}

export function normalizeStatus(value) {
  return String(value || '').trim().toUpperCase();
}

export function sumBy(items, getter) {
  return items.reduce((total, item) => total + Number(getter(item) || 0), 0);
}

export function groupExpensesByBudget(expenses) {
  return expenses.reduce((acc, expense) => {
    const key = expense.budget || expense.budget_id || expense.budget?.id;
    if (key == null) return acc;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(expense);
    return acc;
  }, {});
}
