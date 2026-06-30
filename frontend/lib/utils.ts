import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function validatePalestinianID(id: string): boolean {
  return /^[0-9]{9}$/.test(id);
}

export function isUnderage(birthDate: string | Date): boolean {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age < 18;
}

// FIX: Use a valid email domain instead of .local (Supabase rejects .local)
export function generateEmailFromID(idNumber: string): string {
  return `user_${idNumber}@gmail.com`;
}
