import validator from 'validator';

export function validateCredentials(email: string, password: string) {
  if (!email || !password) {
    return false;
  }

  return true;
}

export function isValidUrl(url: string): boolean {
  const isValidUrl = validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
  });
  return isValidUrl;
}
