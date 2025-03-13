import crypto from 'node:crypto';
import { envConfig } from '@/config/env.config';

export function authentication(salt: string, password: string): string {
  return crypto
    .createHmac('sha256', [salt, password].join('/'))
    .update(envConfig.PWSECRET)
    .digest('hex');
}

export const random = () => crypto.randomBytes(128).toString('hex');
