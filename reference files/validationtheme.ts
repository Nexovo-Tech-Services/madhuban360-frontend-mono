export const validationMessages = {
    required: "This field is required.",
    mobileRequired: "Please enter your mobile number.",
    mobileTooLong: "Only 10 digits are allowed.",
    mobileLength: "Please enter a 10-digit mobile number.",
    digitsOnly: "Only digits are allowed.",
    nameInvalid: "Please enter a valid name.",
    aadhaarInvalid: "Please enter a valid 12-digit Aadhaar number.",
    fishingRequired: "Please enter Fishing Nets count.",
    plasticRequired: "Please enter Plastic Bottle or Plastic Bags count.",
    arrivalRequired: "Please enter arrival quantity.",
    lossReasonRequired: "Please select a reason for loss.",
    otherDetailsRequired: "Please enter details for 'Other'.",
  };
  
  export const validationStyles = {
    errorText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: "#DC2626",
      marginTop: 6,
    },
    toast: {
      backgroundColor: "#ECFDF3",
      borderWidth: 1,
      borderColor: "#A7F3D0",
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    toastTitle: {
      fontFamily: "Inter_500Medium",
      fontSize: 13,
      color: "#047857",
    },
    toastSubtitle: {
      marginTop: 2,
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: "#047857",
    },
    helperText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: "#6B7280",
      marginTop: 6,
    },
    inputErrorBorder: {
      borderColor: "#DC2626",
    },
  };
  
  export function sanitizeDigits(input: string) {
    return input.replace(/\D/g, "");
  }
  
  export function clampDigits(input: string, maxLen: number) {
    return sanitizeDigits(input).slice(0, maxLen);
  }
  
  export function isValidIndianMobile(digits: string) {
    return /^[6-9]\d{9}$/.test(digits);
  }
  
  export function getIndianMobileError(opts: {
    digits: string;
    isTooLong?: boolean;
    requiredMessage?: string;
  }) {
    const trimmed = sanitizeDigits(opts.digits || "");
    const len = trimmed.length;
  
    if (!trimmed) {
      return opts.requiredMessage ?? validationMessages.mobileRequired;
    }
  
    if (len > 10) {
      // Even if callers pass an isTooLong flag, always trust the actual length.
      return validationMessages.mobileTooLong;
    }
  
    if (len < 10) {
      return validationMessages.mobileLength;
    }
  
    return null;
  }
  
  export function isLoginCredentialError(rawMessage?: string | null) {
    if (!rawMessage) return false;
    const normalized = rawMessage.toLowerCase();
    return (
      normalized.includes("incorrect mobile number") ||
      normalized.includes("incorrect password")
    );
  }
  
  export function isValidName(value: string) {
    const trimmed = value.trim();
    if (trimmed.length < 2) return false;
    return /^[A-Za-z][A-Za-z .'-]*$/.test(trimmed);
  }
  
  export function isValidAadhaar(value: string) {
    return /^[2-9]\d{11}$/.test(value);
  }
  