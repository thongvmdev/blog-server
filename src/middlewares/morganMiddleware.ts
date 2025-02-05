import morgan, { type StreamOptions } from 'morgan';

import { logger } from '@/common/utils/logger';
import { envConfig } from '@/config/env.config';

const morganStream: StreamOptions = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

const logFormat = envConfig.NODE_ENV === 'production' ? 'tiny' : 'combined';
const morganMiddleware = morgan(logFormat, { stream: morganStream });

export default morganMiddleware;
