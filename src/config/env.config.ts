import { defineEnv, num, str } from '@daopk/env';

export const envConfig = defineEnv({
  NODE_ENV: str(),
  JWT_SECRET: str(),
  PORT: num({ default: 4000 }),
  MONGO_URL: str(),
  PWSECRET: str(),
  GOOGLE_CLIENT_ID: str(),
});

console.log('🚀 ~ envConfig:', envConfig);
