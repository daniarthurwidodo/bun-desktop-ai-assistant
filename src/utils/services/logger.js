const LOG_PREFIX = '[BunAI]';

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = LogLevel.DEBUG;

const formatMessage = (level, message, data) => {
  const timestamp = new Date().toISOString();
  const prefix = `${LOG_PREFIX} [${level}] ${timestamp}`;
  return {
    prefix,
    message,
    data,
  };
};

const logger = {
  debug: (message, data) => {
    if (currentLevel <= LogLevel.DEBUG) {
      const formatted = formatMessage('DEBUG', message, data);
      console.debug(`${formatted.prefix} - ${formatted.message}`, formatted.data || '');
    }
  },

  info: (message, data) => {
    if (currentLevel <= LogLevel.INFO) {
      const formatted = formatMessage('INFO', message, data);
      console.info(`${formatted.prefix} - ${formatted.message}`, formatted.data || '');
    }
  },

  warn: (message, data) => {
    if (currentLevel <= LogLevel.WARN) {
      const formatted = formatMessage('WARN', message, data);
      console.warn(`${formatted.prefix} - ${formatted.message}`, formatted.data || '');
    }
  },

  error: (message, data) => {
    if (currentLevel <= LogLevel.ERROR) {
      const formatted = formatMessage('ERROR', message, data);
      console.error(`${formatted.prefix} - ${formatted.message}`, formatted.data || '');
    }
  },
};

export default logger;
