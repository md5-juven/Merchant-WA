/**
 * Regex and validation for each form field.
 * Errors are returned for display directly below the respective input.
 */

// Merchant Store Name: 2–100 chars, letters, numbers, spaces, common punctuation
const STORE_NAME_REGEX = /^[\p{L}\p{N}\s\-'&.]{2,100}$/u;

// Merchant Name: 2–80 chars, letters, spaces, apostrophe, hyphen, period (e.g. O'Brien, Jean-Pierre)
const MERCHANT_NAME_REGEX = /^[\p{L}\s.'\-]{2,80}$/u;

// Phone: 10–15 digits (after stripping non-digits)
const PHONE_REGEX = /^\d{10,15}$/;

// Address: at least 10 chars, allow letters, numbers, spaces, commas, dots, hyphens, slashes, newlines
const ADDRESS_MIN_LENGTH = 10;
const ADDRESS_MAX_LENGTH = 500;
const ADDRESS_REGEX = /^[\p{L}\p{N}\s,.\-\/\n]{10,500}$/u;

// Pincode: exactly 6 digits
const PINCODE_REGEX = /^\d{6}$/;

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateStoreName(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, message: 'Merchant store name is required' };
  if (trimmed.length < 2) return { valid: false, message: 'Store name must be at least 2 characters' };
  if (!STORE_NAME_REGEX.test(trimmed)) {
    return { valid: false, message: 'Use only letters, numbers, spaces, and - \' & .' };
  }
  return { valid: true };
}

export function validateMerchantName(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, message: 'Merchant name is required' };
  if (trimmed.length < 2) return { valid: false, message: 'Name must be at least 2 characters' };
  if (!MERCHANT_NAME_REGEX.test(trimmed)) {
    return { valid: false, message: 'Use only letters, spaces, and . \' -' };
  }
  return { valid: true };
}

export function validatePhone(value: string): ValidationResult {
  const cleaned = value.replace(/\D/g, '');
  if (!cleaned) return { valid: false, message: 'Phone number is required' };
  if (!PHONE_REGEX.test(cleaned)) {
    return { valid: false, message: 'Enter a valid 10–15 digit phone number' };
  }
  return { valid: true };
}

export function validateAddress(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, message: 'Address is required' };
  if (trimmed.length < ADDRESS_MIN_LENGTH) {
    return { valid: false, message: `Address must be at least ${ADDRESS_MIN_LENGTH} characters` };
  }
  if (trimmed.length > ADDRESS_MAX_LENGTH) {
    return { valid: false, message: `Address must be at most ${ADDRESS_MAX_LENGTH} characters` };
  }
  if (!ADDRESS_REGEX.test(trimmed)) {
    return { valid: false, message: 'Use only letters, numbers, spaces, and , . - /' };
  }
  return { valid: true };
}

export function validatePinCode(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, message: 'Pin code is required' };
  if (!PINCODE_REGEX.test(trimmed)) {
    return { valid: false, message: 'Pin code must be exactly 6 digits' };
  }
  return { valid: true };
}

export function validateInterest(value: string): ValidationResult {
  if (!value || (value !== 'interested' && value !== 'not-interested')) {
    return { valid: false, message: 'Please select Interested or Not interested' };
  }
  return { valid: true };
}
