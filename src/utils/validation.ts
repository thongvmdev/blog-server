import validator from 'validator';

export const validateCredentials = (email: string, password: string) => {
  if (!email || !password) {
    return false;
  }

  return true;
};

export const isValidUrl = (url: string): boolean => {
  const isValidUrl = validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
  return isValidUrl;
};
