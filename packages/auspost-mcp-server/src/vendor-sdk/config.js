import { ConfigurationError } from './errors.js';

// Default base URLs
const DEFAULT_URLS = {
  testbed: 'https://digitalapi.auspost.com.au/test/shipping/v1',
  production: 'https://digitalapi.auspost.com.au/shipping/v1'
};

class Config {
  /**
   * Create SDK configuration
   * @param {Object} options - Configuration options
   * @param {string} [options.apiKey] - API key (or use AUSPOST_API_KEY env var)
   * @param {string} [options.apiPassword] - API password (or use AUSPOST_API_PASSWORD env var)
   * @param {string} [options.accountNumber] - Account number (or use AUSPOST_ACCOUNT_NUMBER env var)
   * @param {string} [options.baseUrl] - API base URL (or use AUSPOST_BASE_URL env var)
   * @param {number} [options.timeout=30000] - Request timeout in ms (or use AUSPOST_TIMEOUT env var)
   */
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.AUSPOST_API_KEY;
    this.apiPassword = options.apiPassword || process.env.AUSPOST_API_PASSWORD;
    this.accountNumber = options.accountNumber || process.env.AUSPOST_ACCOUNT_NUMBER;
    this.baseUrl = options.baseUrl || process.env.AUSPOST_BASE_URL || DEFAULT_URLS.testbed;
    this.timeout = options.timeout || parseInt(process.env.AUSPOST_TIMEOUT, 10) || 30000;

    this.validate();
  }

  /**
   * Validate required configuration options
   * @throws {ConfigurationError} If required options are missing
   */
  validate() {
    if (!this.apiKey) {
      throw new ConfigurationError('API key is required. Provide apiKey option or set AUSPOST_API_KEY environment variable.');
    }

    if (!this.apiPassword) {
      throw new ConfigurationError('API password is required. Provide apiPassword option or set AUSPOST_API_PASSWORD environment variable.');
    }

    if (!this.accountNumber) {
      throw new ConfigurationError('Account number is required. Provide accountNumber option or set AUSPOST_ACCOUNT_NUMBER environment variable.');
    }

    if (!this.baseUrl || typeof this.baseUrl !== 'string') {
      throw new ConfigurationError('Base URL is required. Provide baseUrl option or set AUSPOST_BASE_URL environment variable.');
    }

    if (typeof this.timeout !== 'number' || this.timeout <= 0) {
      throw new ConfigurationError('Timeout must be a positive number.');
    }
  }

  /**
   * Get the base URL
   * @returns {string} Base URL
   */
  getBaseUrl() {
    return this.baseUrl;
  }

  /**
   * Get formatted account number (10-digit, zero-padded)
   * @returns {string} Formatted account number
   */
  getFormattedAccountNumber() {
    return String(this.accountNumber).padStart(10, '0');
  }

  /**
   * Get default headers for API requests
   * @returns {Object} Headers object
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Account-Number': this.getFormattedAccountNumber()
    };
  }
}

// Export default URLs for reference
Config.URLS = DEFAULT_URLS;

export default Config;
