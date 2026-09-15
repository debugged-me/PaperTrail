// src/constants.js — design tokens + seed data from the dashboard design

export const CATS = {
  Meals:   { color: '#B4690E', tint: '#FBF2E0', border: '#F0DCB4' },
  Expense: { color: '#0B6B57', tint: '#E6F0EC', border: '#C6DED7' },
  Travel:  { color: '#2A5C8A', tint: '#E7EEF5', border: '#C7D8E8' },
  Hygiene: { color: '#7A4B8F', tint: '#F1EAF4', border: '#DFCDE6' },
};

export const CAT_NAMES = ['Meals', 'Expense', 'Travel', 'Hygiene'];

export function cat(name) {
  return CATS[name] || { color: '#6A7176', tint: '#F1EEE7', border: '#E3DED3' };
}

export function money(n) {
  return '$' + (Number(n) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

export function moneyShort(n) {
  return '$' + Math.round(Number(n) || 0).toLocaleString('en-US');
}

// OCR extraction step labels (matches the dashboard's simulated flow)
export const EXTRACT_STEPS = [
  'Detecting receipt edges',
  'Reading text (OCR)',
  'Matching merchant',
  'Classifying category',
];
