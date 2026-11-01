// Centralized application configurations

const getLmsApiUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_LMS_SERVER_URL;

  if (!url) {
    const errorMsg = 'Configuration Error: NEXT_PUBLIC_LMS_SERVER_URL is not defined in the environment. Please check your .env or .env.local configuration.';
    console.error(`[LMS Config Error] ${errorMsg}`);
    return '';
  }

  // Trim any trailing slashes for clean URL concatenation
  return url.replace(/\/+$/, '');
};

export const LMS_API_URL = getLmsApiUrl();
export const CONTENT_PROVIDER_URL = process.env.NEXT_PUBLIC_CONTENT_PROVIDER_URL || 'https://content-provider.pharmacollege.lk';
export const PAYMENT_API_URL = process.env.NEXT_PUBLIC_PAYMENT_API_URL || 'https://api.pharmacollege.lk';
export const BOOKS_API_URL = process.env.NEXT_PUBLIC_BOOKS_API_URL || 'https://qa-api.pharmacollege.lk';
