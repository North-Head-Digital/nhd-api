/**
 * Logger Utility
 * Provides environment-aware logging with different levels
 * 
 * Usage:
 *   const logger = require('./utils/logger');
 *   logger.info('User logged in', { userId: 123 });
 *   logger.error('Failed to connect', error);
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? 
  (process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG);

const COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[90m', // Gray
  RESET: '\x1b[0m',
};

class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.isTest = process.env.NODE_ENV === 'test';
  }

  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    const color = COLORS[level];
    const reset = COLORS.RESET;
    
    let formattedMessage = `${color}[${timestamp}] [${level}]${reset} ${message}`;
    
    if (data) {
      if (data instanceof Error) {
        formattedMessage += `\n${color}Error: ${data.message}${reset}`;
        if (!this.isProduction && data.stack) {
          formattedMessage += `\n${data.stack}`;
        }
      } else if (typeof data === 'object') {
        formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
      } else {
        formattedMessage += ` ${data}`;
      }
    }
    
    return formattedMessage;
  }

  log(level, levelValue, message, data) {
    // Don't log in test environment unless it's an error
    if (this.isTest && levelValue > LOG_LEVELS.ERROR) {
      return;
    }

    if (levelValue <= CURRENT_LEVEL) {
      const formattedMessage = this.formatMessage(level, message, data);
      
      if (levelValue === LOG_LEVELS.ERROR) {
        console.error(formattedMessage);
      } else if (levelValue === LOG_LEVELS.WARN) {
        console.warn(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
    }
  }

  error(message, error) {
    this.log('ERROR', LOG_LEVELS.ERROR, message, error);
  }

  warn(message, data) {
    this.log('WARN', LOG_LEVELS.WARN, message, data);
  }

  info(message, data) {
    this.log('INFO', LOG_LEVELS.INFO, message, data);
  }

  debug(message, data) {
    this.log('DEBUG', LOG_LEVELS.DEBUG, message, data);
  }

  // Special method for HTTP request logging
  http(method, path, statusCode, responseTime) {
    if (this.isTest) return;
    
    let color = COLORS.INFO;
    if (statusCode >= 400) {
      color = COLORS.ERROR;
    } else if (statusCode >= 300) {
      color = COLORS.WARN;
    }
    
    const reset = COLORS.RESET;
    const message = `${color}${method} ${path} ${statusCode} - ${responseTime}ms${reset}`;
    
    if (LOG_LEVELS.INFO <= CURRENT_LEVEL) {
      console.log(message);
    }
  }
}

module.exports = new Logger();
