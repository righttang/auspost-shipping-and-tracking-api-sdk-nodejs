import axios from 'axios';
import { transformError } from './errors.js';

/**
 * Centralized HTTP client for Australia Post API
 */
class HttpClient {
  /**
   * Create HTTP client
   * @param {Config} config - SDK configuration instance
   * @param {Auth} auth - Authentication handler instance
   */
  constructor(config, auth) {
    this.config = config;
    this.auth = auth;

    this.client = axios.create({
      baseURL: config.getBaseUrl(),
      timeout: config.timeout
    });

    this._setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   * @private
   */
  _setupInterceptors() {
    // Request interceptor: add auth and default headers
    this.client.interceptors.request.use(
      (requestConfig) => {
        requestConfig.headers = {
          ...this.config.getHeaders(),
          ...this.auth.getHeaders(),
          ...requestConfig.headers
        };
        return requestConfig;
      },
      (error) => Promise.reject(transformError(error))
    );

    // Response interceptor: transform errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(transformError(error))
    );
  }

  /**
   * Make GET request
   * @param {string} endpoint - API endpoint path
   * @param {Object} [params] - Query parameters
   * @param {Object} [options] - Additional axios options
   * @returns {Promise<any>} Response data
   */
  async get(endpoint, params = {}, options = {}) {
    const response = await this.client.get(endpoint, { params, ...options });
    return response.data;
  }

  /**
   * Make POST request
   * @param {string} endpoint - API endpoint path
   * @param {Object} [data] - Request body
   * @param {Object} [options] - Additional axios options
   * @returns {Promise<any>} Response data
   */
  async post(endpoint, data = {}, options = {}) {
    const response = await this.client.post(endpoint, data, options);
    return response.data;
  }

  /**
   * Make PUT request
   * @param {string} endpoint - API endpoint path
   * @param {Object} [data] - Request body
   * @param {Object} [options] - Additional axios options
   * @returns {Promise<any>} Response data
   */
  async put(endpoint, data = {}, options = {}) {
    const response = await this.client.put(endpoint, data, options);
    return response.data;
  }

  /**
   * Make DELETE request
   * @param {string} endpoint - API endpoint path
   * @param {Object} [options] - Additional axios options
   * @returns {Promise<any>} Response data
   */
  async delete(endpoint, options = {}) {
    const response = await this.client.delete(endpoint, options);
    return response.data;
  }

  /**
   * Make request with raw response (for binary data like PDFs)
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint path
   * @param {Object} [options] - Axios options
   * @returns {Promise<Buffer>} Response buffer
   */
  async getRaw(endpoint, options = {}) {
    const response = await this.client.get(endpoint, {
      ...options,
      responseType: 'arraybuffer'
    });
    return response.data;
  }
}

export default HttpClient;
