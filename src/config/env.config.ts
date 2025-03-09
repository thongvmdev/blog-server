const getEnvVar = (key: string, defaultValue?: string | number): string | number => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};

const config = () => ({
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: getEnvVar('PORT', 8080),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  APP_URL: getEnvVar('APP_URL')
});

const envConfig = config();
console.log('🚀 ~ envConfig:', envConfig);

export { envConfig };
