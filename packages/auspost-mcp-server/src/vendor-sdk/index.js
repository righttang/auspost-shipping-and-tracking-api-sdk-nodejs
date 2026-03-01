import Config from './config.js';
import Auth from './auth.js';
import HttpClient from './http-client.js';
import Shipping from './shipping.js';
import Tracking from './tracking.js';
import * as errors from './errors.js';

/**
 * Australia Post SDK
 * Main entry point for interacting with Australia Post Shipping and Tracking APIs
 */
class AusPostSDK {
  /**
   * Create Australia Post SDK instance
   * @param {Object} [options] - Configuration options
   * @param {string} [options.apiKey] - API key (or use AUSPOST_API_KEY env var)
   * @param {string} [options.apiPassword] - API password (or use AUSPOST_API_PASSWORD env var)
   * @param {string} [options.accountNumber] - Account number (or use AUSPOST_ACCOUNT_NUMBER env var)
   * @param {string} [options.baseUrl] - API base URL (or use AUSPOST_BASE_URL env var)
   * @param {number} [options.timeout=30000] - Request timeout in ms (or use AUSPOST_TIMEOUT env var)
   */
  constructor(options = {}) {
    this.config = new Config(options);
    this.auth = new Auth(this.config);
    this.httpClient = new HttpClient(this.config, this.auth);

    this._shipping = null;
    this._tracking = null;
  }

  /**
   * Get Shipping operations instance
   * @returns {Shipping} Shipping operations handler
   */
  get shipping() {
    if (!this._shipping) {
      this._shipping = new Shipping(this.httpClient, this.config);
    }
    return this._shipping;
  }

  /**
   * Get Tracking operations instance
   * @returns {Tracking} Tracking operations handler
   */
  get tracking() {
    if (!this._tracking) {
      this._tracking = new Tracking(this.httpClient);
    }
    return this._tracking;
  }

  /**
   * Validate credentials by fetching account details
   * @returns {Promise<boolean>} True if credentials are valid
   * @throws {AuthenticationError} If credentials are invalid
   */
  async validateCredentials() {
    await this.shipping.getAccountDetails();
    return true;
  }

  /**
   * Get the configured base URL
   * @returns {string} Base API URL
   */
  get baseUrl() {
    return this.config.getBaseUrl();
  }
}

export default AusPostSDK;
export { AusPostSDK, Config, Auth, HttpClient, Shipping, Tracking, errors };
