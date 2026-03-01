import { ValidationError } from './errors.js';

/**
 * Tracking operations for Australia Post API
 * Note: Rate limited to 10 requests per minute
 */
class Tracking {
  /**
   * Create Tracking operations handler
   * @param {HttpClient} httpClient - HTTP client instance
   */
  constructor(httpClient) {
    this.http = httpClient;
  }

  /**
   * Track multiple items by tracking IDs
   * @param {string|string[]} trackingIds - Single tracking ID or array of tracking IDs (max 10)
   * @returns {Promise<Object>} Tracking results
   * @throws {ValidationError} If more than 10 tracking IDs provided
   */
  async trackItems(trackingIds) {
    const ids = Array.isArray(trackingIds) ? trackingIds : [trackingIds];

    if (ids.length === 0) {
      throw new ValidationError('At least one tracking ID is required');
    }

    if (ids.length > 10) {
      throw new ValidationError('Maximum of 10 tracking IDs allowed per request');
    }

    const trackingIdsParam = ids.join(',');
    return this.http.get('/track', { tracking_ids: trackingIdsParam });
  }

  /**
   * Track a single item by tracking ID
   * Convenience method for tracking one item
   * @param {string} trackingId - Tracking ID (article ID)
   * @returns {Promise<Object>} Tracking result
   */
  async trackItem(trackingId) {
    if (!trackingId) {
      throw new ValidationError('Tracking ID is required');
    }
    return this.trackItems([trackingId]);
  }
}

export default Tracking;
