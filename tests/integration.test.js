import 'dotenv/config';
import AusPostSDK from '../src/index.js';
import Config from '../src/config.js';
import { ConfigurationError, ValidationError } from '../src/errors.js';

// Skip integration tests if credentials are not configured
const hasCredentials = process.env.AUSPOST_API_KEY &&
                       process.env.AUSPOST_API_PASSWORD &&
                       process.env.AUSPOST_ACCOUNT_NUMBER;

const describeIntegration = hasCredentials ? describe : describe.skip;

describe('AusPostSDK', () => {
  describe('Configuration', () => {
    // Save original env values
    const originalEnv = { ...process.env };

    beforeEach(() => {
      // Clear env vars for configuration tests
      delete process.env.AUSPOST_API_KEY;
      delete process.env.AUSPOST_API_PASSWORD;
      delete process.env.AUSPOST_ACCOUNT_NUMBER;
    });

    afterEach(() => {
      // Restore original env values
      process.env.AUSPOST_API_KEY = originalEnv.AUSPOST_API_KEY;
      process.env.AUSPOST_API_PASSWORD = originalEnv.AUSPOST_API_PASSWORD;
      process.env.AUSPOST_ACCOUNT_NUMBER = originalEnv.AUSPOST_ACCOUNT_NUMBER;
    });

    it('should throw ConfigurationError when API key is missing', () => {
      expect(() => new AusPostSDK({
        apiPassword: 'password',
        accountNumber: '1234567890'
      })).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError when API password is missing', () => {
      expect(() => new AusPostSDK({
        apiKey: 'key',
        accountNumber: '1234567890'
      })).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError when account number is missing', () => {
      expect(() => new AusPostSDK({
        apiKey: 'key',
        apiPassword: 'password'
      })).toThrow(ConfigurationError);
    });

    it('should create SDK with valid configuration', () => {
      const sdk = new AusPostSDK({
        apiKey: 'key',
        apiPassword: 'password',
        accountNumber: '1234567890'
      });
      expect(sdk).toBeInstanceOf(AusPostSDK);
    });

    it('should pad account number to 10 digits', () => {
      const sdk = new AusPostSDK({
        apiKey: 'key',
        apiPassword: 'password',
        accountNumber: '12345'
      });
      expect(sdk.config.getFormattedAccountNumber()).toBe('0000012345');
    });

    it('should use default testbed URL when no baseUrl provided', () => {
      const sdk = new AusPostSDK({
        apiKey: 'key',
        apiPassword: 'password',
        accountNumber: '1234567890'
      });
      expect(sdk.baseUrl).toBe(Config.URLS.testbed);
    });

    it('should use custom baseUrl when provided', () => {
      const customUrl = 'https://custom.api.example.com/v1';
      const sdk = new AusPostSDK({
        apiKey: 'key',
        apiPassword: 'password',
        accountNumber: '1234567890',
        baseUrl: customUrl
      });
      expect(sdk.baseUrl).toBe(customUrl);
    });

    it('should expose default URLs via Config.URLS', () => {
      expect(Config.URLS.testbed).toBe('https://digitalapi.auspost.com.au/test/shipping/v1');
      expect(Config.URLS.production).toBe('https://digitalapi.auspost.com.au/shipping/v1');
    });
  });

  describe('Auth', () => {
    it('should generate correct Basic Auth header', () => {
      const sdk = new AusPostSDK({
        apiKey: 'testkey',
        apiPassword: 'testpassword',
        accountNumber: '1234567890'
      });

      const expectedBase64 = Buffer.from('testkey:testpassword').toString('base64');
      expect(sdk.auth.getAuthorizationHeader()).toBe(`Basic ${expectedBase64}`);
    });
  });

  describe('Shipping Validation', () => {
    let sdk;

    beforeEach(() => {
      sdk = new AusPostSDK({
        apiKey: 'key',
        apiPassword: 'password',
        accountNumber: '1234567890'
      });
    });

    it('should throw ValidationError when shipment ID is missing for getShipment', async () => {
      await expect(sdk.shipping.getShipment('')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when pagination params missing for getShipments', async () => {
      await expect(sdk.shipping.getShipments()).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when shipment ID is missing for updateShipment', async () => {
      await expect(sdk.shipping.updateShipment('', {})).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when shipment ID is missing for deleteShipment', async () => {
      await expect(sdk.shipping.deleteShipment('')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when batch delete contains empty shipment ID', async () => {
      await expect(sdk.shipping.deleteShipment(['shipment-1', ''])).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when getShipmentPrice request is incomplete', async () => {
      await expect(sdk.shipping.getShipmentPrice({})).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when getItemPrices request is incomplete', async () => {
      await expect(sdk.shipping.getItemPrices({})).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when no shipment IDs for createOrder', async () => {
      await expect(sdk.shipping.createOrder([])).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when order ID is missing for getOrder', async () => {
      await expect(sdk.shipping.getOrder('')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when no shipment IDs for createLabels', async () => {
      await expect(sdk.shipping.createLabels([])).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when suburb validation params missing', async () => {
      await expect(sdk.shipping.validateSuburb('', 'NSW', '2000')).rejects.toThrow(ValidationError);
    });
  });

  describe('Tracking Validation', () => {
    let sdk;

    beforeEach(() => {
      sdk = new AusPostSDK({
        apiKey: 'key',
        apiPassword: 'password',
        accountNumber: '1234567890'
      });
    });

    it('should throw ValidationError when no tracking IDs provided', async () => {
      await expect(sdk.tracking.trackItems([])).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when more than 10 tracking IDs', async () => {
      const ids = Array.from({ length: 11 }, (_, i) => `TRACK${i}`);
      await expect(sdk.tracking.trackItems(ids)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError when tracking ID is empty for trackItem', async () => {
      await expect(sdk.tracking.trackItem('')).rejects.toThrow(ValidationError);
    });
  });
});

// Integration tests - require real API credentials
describeIntegration('Integration Tests', () => {
  let sdk;

  beforeAll(() => {
    sdk = new AusPostSDK({
      apiKey: process.env.AUSPOST_API_KEY,
      apiPassword: process.env.AUSPOST_API_PASSWORD,
      accountNumber: process.env.AUSPOST_ACCOUNT_NUMBER,
      baseUrl: process.env.AUSPOST_BASE_URL
    });
  });

  describe('Account', () => {
    it('should validate credentials', async () => {
      const isValid = await sdk.validateCredentials();
      expect(isValid).toBe(true);
    });

    it('should get account details', async () => {
      const account = await sdk.shipping.getAccountDetails();
      expect(account).toBeDefined();
      expect(account.account_number).toBeDefined();
    });
  });

  describe('Address Validation', () => {
    it('should validate a valid suburb', async () => {
      const result = await sdk.shipping.validateSuburb('SYDNEY', 'NSW', '2000');
      expect(result).toBeDefined();
    });
  });

  describe('Shipment Workflow', () => {
    let shipmentId;

    const testShipment = {
      shipment_reference: 'TEST-' + Date.now(),
      from: {
        name: 'Test Sender',
        lines: ['123 Test Street'],
        suburb: 'SYDNEY',
        state: 'NSW',
        postcode: '2000',
        country: 'AU'
      },
      to: {
        name: 'Test Recipient',
        lines: ['456 Sample Road'],
        suburb: 'MELBOURNE',
        state: 'VIC',
        postcode: '3000',
        country: 'AU'
      },
      items: [{
        item_reference: 'ITEM-001',
        product_id: '7E55',
        length: 10,
        width: 10,
        height: 10,
        weight: 1,
        authority_to_leave: true
      }]
    };

    it('should validate shipment data', async () => {
      const result = await sdk.shipping.validateShipment(testShipment);
      expect(result).toBeDefined();
    });

    it('should create a shipment', async () => {
      const result = await sdk.shipping.createShipment(testShipment);
      expect(result).toBeDefined();
      expect(result.shipments).toBeDefined();
      expect(result.shipments.length).toBeGreaterThan(0);
      shipmentId = result.shipments[0].shipment_id;
    });

    it('should get shipment details', async () => {
      if (!shipmentId) {
        console.log('Skipping - no shipment ID from previous test');
        return;
      }
      const result = await sdk.shipping.getShipment(shipmentId);
      expect(result).toBeDefined();
    });

    it('should get shipments with pagination', async () => {
      const result = await sdk.shipping.getShipments({
        offset: 0,
        numberOfShipments: 1
      });
      expect(result).toBeDefined();
    });

    it('should delete shipment', async () => {
      if (!shipmentId) {
        console.log('Skipping - no shipment ID from previous test');
        return;
      }
      const result = await sdk.shipping.deleteShipment(shipmentId);
      expect(result).toBeDefined();
    });
  });

  describe('Pricing', () => {
    it('should get item prices (base pricing)', async () => {
      const priceRequest = {
        from: { postcode: '2000' },
        to: { postcode: '3000' },
        items: [{
          product_id: '7E55',
          length: 10,
          width: 10,
          height: 10,
          weight: 1
        }]
      };

      const result = await sdk.shipping.getItemPrices(priceRequest);
      expect(result).toBeDefined();
    });

    it('should get shipment price (with surcharges)', async () => {
      const priceRequest = {
        shipments: [{
          from: {
            postcode: '2000',
            suburb: 'SYDNEY',
            state: 'NSW'
          },
          to: {
            postcode: '3000',
            suburb: 'MELBOURNE',
            state: 'VIC'
          },
          items: [{
            product_id: '7E55',
            length: 10,
            width: 10,
            height: 10,
            weight: 1
          }]
        }]
      };

      const result = await sdk.shipping.getShipmentPrice(priceRequest);
      expect(result).toBeDefined();
      expect(result.shipments).toBeDefined();
    });
  });
});
