import type { StreamOptions } from 'morgan';

import { envConfig } from '@/config/env.config';
import { logger } from '@/utils/logger';
import morgan from 'morgan';

const morganStream: StreamOptions = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

const logFormat = envConfig.NODE_ENV === 'production' ? 'tiny' : 'combined';
const morganMiddleware = morgan(logFormat, { stream: morganStream });

export default morganMiddleware;
