import { ValidationError } from './errors.js';

/**
 * Shipping operations for Australia Post API
 */
class Shipping {
  /**
   * Create Shipping operations handler
   * @param {HttpClient} httpClient - HTTP client instance
   * @param {Config} config - SDK configuration instance
   */
  constructor(httpClient, config) {
    this.http = httpClient;
    this.config = config;
  }

  // ==================== Account ====================

  /**
   * Get account details and available products
   * @returns {Promise<Object>} Account details
   */
  async getAccountDetails() {
    const accountNumber = this.config.getFormattedAccountNumber();
    return this.http.get(`/accounts/${accountNumber}`);
  }

  // ==================== Shipments ====================

  /**
   * Create one or more shipments
   * @param {Object|Object[]} shipments - Single shipment or array of shipments
   * @returns {Promise<Object>} Created shipments response
   */
  async createShipment(shipments) {
    const shipmentsArray = Array.isArray(shipments) ? shipments : [shipments];
    return this.http.post('/shipments', { shipments: shipmentsArray });
  }

  /**
   * Get shipment details by ID(s)
   * @param {string|string[]} shipmentIds - Single shipment ID or array of shipment IDs
   * @returns {Promise<Object>} Shipment details
   */
  async getShipment(shipmentIds) {
    const ids = Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds];
    if (ids.length === 0 || !ids[0]) {
      throw new ValidationError('Shipment ID is required');
    }
    return this.http.get('/shipments', { shipment_ids: ids.join(',') });
  }

  /**
   * Get shipments with pagination
   * @param {Object} options - Pagination options
   * @param {number} options.offset - Starting record number (0-based)
   * @param {number} options.numberOfShipments - Number of records to return
   * @param {string} [options.status] - Filter by status (e.g., 'Created', 'Initiated')
   * @param {string} [options.despatchDate] - Filter by date (yyyy-MM-dd)
   * @param {string} [options.senderReference] - Filter by sender reference
   * @returns {Promise<Object>} Shipments list
   */
  async getShipments(options = {}) {
    if (options.offset === undefined || options.numberOfShipments === undefined) {
      throw new ValidationError('offset and numberOfShipments are required for pagination');
    }
    const params = {
      offset: options.offset,
      number_of_shipments: options.numberOfShipments
    };
    if (options.status) params.status = options.status;
    if (options.despatchDate) params.despatch_date = options.despatchDate;
    if (options.senderReference) params.sender_reference = options.senderReference;
    return this.http.get('/shipments', params);
  }

  /**
   * Update an existing shipment
   * @param {string} shipmentId - Shipment ID
   * @param {Object} data - Updated shipment data
   * @returns {Promise<Object>} Updated shipment response
   */
  async updateShipment(shipmentId, data) {
    if (!shipmentId) {
      throw new ValidationError('Shipment ID is required');
    }
    return this.http.put(`/shipments/${shipmentId}`, data);
  }

  /**
   * Delete one or more shipments
   * @param {string|string[]} shipmentIds - Single shipment ID or array of shipment IDs
   * @returns {Promise<Object>} Deletion response
   */
  async deleteShipment(shipmentIds) {
    const ids = Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds];
    const validIds = ids.filter(Boolean);

    if (validIds.length === 0) {
      throw new ValidationError('Shipment ID is required');
    }

    if (validIds.length !== ids.length) {
      throw new ValidationError('All shipment IDs must be non-empty');
    }

    if (validIds.length === 1) {
      return this.http.delete(`/shipments/${validIds[0]}`);
    }

    return this.http.delete('/shipments', {
      params: {
        shipment_ids: validIds.join(',')
      }
    });
  }

  /**
   * Validate shipment data without creating
   * @param {Object|Object[]} shipments - Single shipment or array of shipments
   * @returns {Promise<Object>} Validation result (empty body on success, errors on failure)
   */
  async validateShipment(shipments) {
    const shipmentsArray = Array.isArray(shipments) ? shipments : [shipments];
    return this.http.post('/shipments/validation', { shipments: shipmentsArray });
  }

  /**
   * Get item prices (base pricing without surcharges)
   * Use this for quick price estimates based on postcodes
   * @param {Object} data - Price request with from, to, and items
   * @param {Object} data.from - Origin with postcode
   * @param {Object} data.to - Destination with postcode
   * @param {Object[]} data.items - Items with dimensions, weight, and optional product_id
   * @returns {Promise<Object>} Price calculation response with available products
   */
  async getItemPrices(data) {
    if (!data || !data.from || !data.to || !data.items) {
      throw new ValidationError('Price request requires from, to, and items');
    }
    return this.http.post('/prices/items', data);
  }

  /**
   * Get shipment price (full pricing with surcharges including fuel)
   * Use this for accurate final pricing
   * @param {Object} data - Shipment data with from, to, and items (same as createShipment)
   * @param {Object|Object[]} data.shipments - Shipment(s) to price
   * @returns {Promise<Object>} Full price calculation including surcharges
   */
  async getShipmentPrice(data) {
    if (!data || !data.shipments) {
      throw new ValidationError('Price request requires shipments array');
    }
    const shipmentsArray = Array.isArray(data.shipments) ? data.shipments : [data.shipments];
    return this.http.post('/prices/shipments', { shipments: shipmentsArray });
  }

  // ==================== Orders ====================

  /**
   * Create an order from existing shipments (uses PUT method)
   * @param {string[]} shipmentIds - Array of shipment IDs
   * @param {Object} [options] - Order options
   * @param {string} [options.orderReference] - Your reference for this order
   * @param {string} [options.paymentMethod='CHARGE_TO_ACCOUNT'] - Payment method
   * @param {string} [options.consignor] - Consignor name/ID for traceability
   * @returns {Promise<Object>} Created order response
   */
  async createOrder(shipmentIds, options = {}) {
    if (!shipmentIds || shipmentIds.length === 0) {
      throw new ValidationError('At least one shipment ID is required');
    }

    const shipments = shipmentIds.map(id => ({ shipment_id: id }));
    const payload = {
      shipments,
      payment_method: options.paymentMethod || 'CHARGE_TO_ACCOUNT'
    };

    if (options.orderReference) {
      payload.order_reference = options.orderReference;
    }

    if (options.consignor) {
      payload.consignor = options.consignor;
    }

    // Note: Create Order From Shipments uses PUT method
    return this.http.put('/orders', payload);
  }

  /**
   * Get order details by ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrder(orderId) {
    if (!orderId) {
      throw new ValidationError('Order ID is required');
    }
    return this.http.get(`/orders/${orderId}`);
  }

  /**
   * Get order summary as PDF
   * @param {string} orderId - Order ID
   * @returns {Promise<Buffer>} PDF buffer
   */
  async getOrderSummary(orderId) {
    if (!orderId) {
      throw new ValidationError('Order ID is required');
    }
    const accountNumber = this.config.getFormattedAccountNumber();
    return this.http.getRaw(`/accounts/${accountNumber}/orders/${orderId}/summary`);
  }

  // ==================== Labels ====================

  /**
   * Create shipping labels
   * @param {string[]} shipmentIds - Array of shipment IDs
   * @param {Object} [options] - Label options
   * @param {string} [options.group='Parcel Post'] - Product group: 'Parcel Post', 'Express Post', 'StarTrack', 'Startrack Courier', 'International', 'Commercial'
   * @param {string} [options.layout='A4-1pp'] - Label layout: 'A4-1pp', 'A4-3pp', 'A4-4pp', 'A6-1pp'
   * @param {boolean} [options.branded=true] - Include Australia Post branding
   * @param {number} [options.leftOffset=0] - Left margin adjustment
   * @param {number} [options.topOffset=0] - Top margin adjustment
   * @param {string} [options.format] - Label format: 'PDF' or 'ZPL'
   * @param {boolean} [options.waitForLabelUrl=true] - Return label URL immediately (one-step process)
   * @returns {Promise<Object>} Label creation response
   */
  async createLabels(shipmentIds, options = {}) {
    if (!shipmentIds || shipmentIds.length === 0) {
      throw new ValidationError('At least one shipment ID is required');
    }

    const shipments = shipmentIds.map(id => ({ shipment_id: id }));
    const preference = {
      type: 'PRINT',
      groups: [{
        group: options.group || 'Parcel Post',
        layout: options.layout || 'A4-1pp',
        branded: options.branded !== false,
        left_offset: options.leftOffset !== undefined ? options.leftOffset : 0,
        top_offset: options.topOffset !== undefined ? options.topOffset : 0
      }]
    };

    if (options.format) {
      preference.format = options.format;
    }

    const payload = {
      wait_for_label_url: options.waitForLabelUrl !== false,
      shipments,
      preferences: [preference]
    };

    return this.http.post('/labels', payload);
  }

  /**
   * Get label status and data
   * @param {string} labelId - Label ID
   * @returns {Promise<Object>} Label details
   */
  async getLabel(labelId) {
    if (!labelId) {
      throw new ValidationError('Label ID is required');
    }
    return this.http.get(`/labels/${labelId}`);
  }

  // ==================== Address ====================

  /**
   * Validate suburb, state, and postcode combination
   * @param {string} suburb - Suburb name
   * @param {string} state - State code (ACT, NSW, NT, QLD, SA, TAS, VIC, WA)
   * @param {string} postcode - 4-digit postcode
   * @returns {Promise<Object>} Validation result with found status and matching localities
   */
  async validateSuburb(suburb, state, postcode) {
    if (!suburb || !state || !postcode) {
      throw new ValidationError('Suburb, state, and postcode are required');
    }
    return this.http.get('/address', { suburb, state, postcode });
  }
}

export default Shipping;
