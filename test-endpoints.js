import 'dotenv/config';
import AusPostSDK from './src/index.js';

const sdk = new AusPostSDK({
  apiKey: process.env.AUSPOST_API_KEY,
  apiPassword: process.env.AUSPOST_API_PASSWORD,
  accountNumber: process.env.AUSPOST_ACCOUNT_NUMBER,
  baseUrl: process.env.AUSPOST_BASE_URL
});

console.log('SDK initialized');
console.log('Base URL:', sdk.baseUrl);
console.log('Account:', sdk.config.getFormattedAccountNumber());

async function testGetAccountDetails() {
  console.log('\n=== Test 1: Get Account Details ===');
  try {
    const result = await sdk.shipping.getAccountDetails();
    console.log('SUCCESS: Account', result.account_number);
    return result;
  } catch (error) {
    console.log('ERROR:', error.message);
    throw error;
  }
}

async function testValidateSuburb() {
  console.log('\n=== Test 2: Validate Suburb ===');
  try {
    const result = await sdk.shipping.validateSuburb('SYDNEY', 'NSW', '2000');
    console.log('SUCCESS:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.log('ERROR:', error.message);
    throw error;
  }
}

async function testGetItemPrices() {
  console.log('\n=== Test 3: Get Item Prices (Base pricing) ===');
  try {
    const result = await sdk.shipping.getItemPrices({
      from: { postcode: '3000' },
      to: { postcode: '2000' },
      items: [{
        product_id: '7E55',
        length: 20,
        width: 15,
        height: 10,
        weight: 1.5
      }]
    });
    console.log('SUCCESS:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.log('ERROR:', error.message);
    if (error.details) console.log('Details:', JSON.stringify(error.details, null, 2));
    throw error;
  }
}

async function testGetShipmentPrice() {
  console.log('\n=== Test 4: Get Shipment Price (Full pricing with surcharges) ===');
  try {
    const result = await sdk.shipping.getShipmentPrice({
      shipments: [{
        from: {
          postcode: '3000',
          suburb: 'MELBOURNE',
          state: 'VIC'
        },
        to: {
          postcode: '2000',
          suburb: 'SYDNEY',
          state: 'NSW'
        },
        items: [{
          product_id: '7E55',
          length: 20,
          width: 15,
          height: 10,
          weight: 1.5
        }]
      }]
    });
    console.log('SUCCESS:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.log('ERROR:', error.message);
    if (error.details) console.log('Details:', JSON.stringify(error.details, null, 2));
    throw error;
  }
}

async function testValidateShipment() {
  console.log('\n=== Test 5: Validate Shipment ===');
  try {
    const result = await sdk.shipping.validateShipment({
      shipment_reference: 'TEST-001',
      from: {
        name: 'Test Sender',
        lines: ['123 Test Street'],
        suburb: 'MELBOURNE',
        state: 'VIC',
        postcode: '3000',
        country: 'AU'
      },
      to: {
        name: 'Test Recipient',
        lines: ['456 Test Road'],
        suburb: 'SYDNEY',
        state: 'NSW',
        postcode: '2000',
        country: 'AU'
      },
      items: [{
        item_reference: 'ITEM-001',
        product_id: '7E55',
        length: 20,
        width: 15,
        height: 10,
        weight: 1.5,
        authority_to_leave: true
      }]
    });
    console.log('SUCCESS (empty body = valid):', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.log('ERROR:', error.message);
    if (error.details) console.log('Details:', JSON.stringify(error.details, null, 2));
    throw error;
  }
}

async function testCreateShipment() {
  console.log('\n=== Test 6: Create Shipment ===');
  try {
    const result = await sdk.shipping.createShipment({
      shipment_reference: 'SDK-TEST-' + Date.now(),
      from: {
        name: 'Test Sender',
        lines: ['123 Test Street'],
        suburb: 'MELBOURNE',
        state: 'VIC',
        postcode: '3000',
        country: 'AU'
      },
      to: {
        name: 'Test Recipient',
        lines: ['456 Test Road'],
        suburb: 'SYDNEY',
        state: 'NSW',
        postcode: '2000',
        country: 'AU'
      },
      items: [{
        item_reference: 'ITEM-001',
        product_id: '7E55',
        length: 20,
        width: 15,
        height: 10,
        weight: 1.5,
        authority_to_leave: true
      }]
    });
    console.log('SUCCESS:');
    console.log('  Shipment ID:', result.shipments[0].shipment_id);
    console.log('  Article ID:', result.shipments[0].items[0].tracking_details.article_id);
    return result;
  } catch (error) {
    console.log('ERROR:', error.message);
    if (error.details) console.log('Details:', JSON.stringify(error.details, null, 2));
    throw error;
  }
}

async function testGetShipment(shipmentId) {
  console.log('\n=== Test 7: Get Shipment ===');
  try {
    const result = await sdk.shipping.getShipment(shipmentId);
    console.log('SUCCESS:');
    console.log('  Found shipment:', result.shipments[0].shipment_id);
    return result;
  } catch (error) {
    console.log('ERROR:', error.message);
    throw error;
  }
}

async function testTracking(articleId) {
  console.log('\n=== Test 8: Track Item ===');
  try {
    const result = await sdk.tracking.trackItem(articleId);
    console.log('SUCCESS:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.log('ERROR:', error.message);
    // Tracking may fail for newly created items - that's expected
    return null;
  }
}

async function testDeleteShipment(shipmentId) {
  console.log('\n=== Test 9: Delete Shipment ===');
  try {
    const result = await sdk.shipping.deleteShipment(shipmentId);
    console.log('SUCCESS: Shipment deleted');
    return result;
  } catch (error) {
    console.log('ERROR:', error.message);
    throw error;
  }
}

// Run all tests
async function runTests() {
  try {
    await testGetAccountDetails();
    await testValidateSuburb();
    await testGetItemPrices();
    await testGetShipmentPrice();
    await testValidateShipment();

    const shipment = await testCreateShipment();
    const shipmentId = shipment.shipments[0].shipment_id;
    const articleId = shipment.shipments[0].items[0].tracking_details.article_id;

    await testGetShipment(shipmentId);
    await testTracking(articleId);
    await testDeleteShipment(shipmentId);

    console.log('\n=== All tests completed successfully ===');
  } catch {
    console.log('\n=== Test suite failed ===');
    process.exit(1);
  }
}

runTests();
