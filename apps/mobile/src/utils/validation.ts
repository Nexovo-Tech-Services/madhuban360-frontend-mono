import type { AuthMethod } from "@madhuban/types";
import { colors, font } from "@madhuban/theme";

export const validationMessages = {
  required: "This field is required.",
  mobileRequired: "Please enter your mobile number.",
  mobileTooLong: "Only 10 digits are allowed.",
  mobileLength: "Please enter a valid 10-digit mobile number.",
  emailRequired: "Please enter your email address.",
  emailInvalid: "Please enter a valid email address.",
  mobileOrEmailRequired: "Please enter your mobile number or email.",
  mobileOrEmailInvalid: "Please enter a valid mobile number or email.",
  otpRequired: "Please enter the 4-digit OTP.",
  otpInvalid: "Please enter a valid 4-digit OTP.",
  passwordRequired: "Please enter your password.",
  passwordLength: "Password must be at least 6 characters.",
  confirmPasswordRequired: "Please confirm your password.",
  passwordMismatch: "Passwords do not match.",
} as const;

export const validationStyles = {
  errorText: {
    fontFamily: font.family.medium,
    fontSize: 12,
    color: colors.danger,
    marginTop: 6,
  },
  helperText: {
    fontFamily: font.family.medium,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  inputErrorBorder: {
    borderColor: colors.danger,
  },
} as const;

export function sanitizeDigits(input: string) {
  return String(input || "").replace(/\D/g, "");
}

export function clampDigits(input: string, maxLen: number) {
  return sanitizeDigits(input).slice(0, maxLen);
}

export function isValidIndianMobile(digits: string) {
  return /^[6-9]\d{9}$/.test(sanitizeDigits(digits));
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function getIndianMobileError(rawValue: string, requiredMessage?: string) {
  const digits = sanitizeDigits(rawValue);

  if (!digits) {
    return requiredMessage ?? validationMessages.mobileRequired;
  }

  if (digits.length > 10) {
    return validationMessages.mobileTooLong;
  }

  if (!isValidIndianMobile(digits)) {
    return validationMessages.mobileLength;
  }

  return null;
}

export function getEmailError(rawValue: string, requiredMessage?: string) {
  const value = String(rawValue || "").trim();

  if (!value) {
    return requiredMessage ?? validationMessages.emailRequired;
  }

  if (!isValidEmail(value)) {
    return validationMessages.emailInvalid;
  }

  return null;
}

export function getMobileOrEmailError(rawValue: string) {
  const value = String(rawValue || "").trim();

  if (!value) {
    return validationMessages.mobileOrEmailRequired;
  }

  if (value.includes("@")) {
    return isValidEmail(value) ? null : validationMessages.mobileOrEmailInvalid;
  }

  return getIndianMobileError(value, validationMessages.mobileOrEmailRequired);
}

export function getLoginIdentifierError(method: AuthMethod, rawValue: string) {
  return method === "email" ? getEmailError(rawValue) : getIndianMobileError(rawValue);
}

export function getPasswordError(rawValue: string) {
  const value = String(rawValue || "").trim();

  if (!value) {
    return validationMessages.passwordRequired;
  }

  if (value.length < 6) {
    return validationMessages.passwordLength;
  }

  return null;
}

export function getOtpError(rawValue: string) {
  const digits = sanitizeDigits(rawValue);

  if (!digits) {
    return validationMessages.otpRequired;
  }

  if (digits.length !== 4) {
    return validationMessages.otpInvalid;
  }

  return null;
}

export function getConfirmPasswordError(password: string, confirmPassword: string) {
  if (!String(confirmPassword || "").trim()) {
    return validationMessages.confirmPasswordRequired;
  }

  if (password !== confirmPassword) {
    return validationMessages.passwordMismatch;
  }

  return null;
}
