/**
 * Authentication handler for Australia Post API
 * Uses HTTP Basic Authentication (stateless)
 */
class Auth {
  /**
   * Create authentication handler
   * @param {Config} config - SDK configuration instance
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * Get Base64-encoded credentials for Basic Auth
   * @returns {string} Base64-encoded 'apiKey:apiPassword'
   */
  getEncodedCredentials() {
    const credentials = `${this.config.apiKey}:${this.config.apiPassword}`;
    return Buffer.from(credentials).toString('base64');
  }

  /**
   * Get Authorization header value
   * @returns {string} 'Basic <encoded-credentials>'
   */
  getAuthorizationHeader() {
    return `Basic ${this.getEncodedCredentials()}`;
  }

  /**
   * Get all authentication-related headers
   * @returns {Object} Headers object with Authorization and Account-Number
   */
  getHeaders() {
    return {
      'Authorization': this.getAuthorizationHeader(),
      'Account-Number': this.config.getFormattedAccountNumber()
    };
  }
}

export default Auth;
