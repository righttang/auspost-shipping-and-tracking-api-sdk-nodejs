import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createLabelsSchema,
  getItemPricesSchema,
  getShipmentPriceSchema,
  runFulfillmentFlowSchema,
  trackItemsSchema,
  updateShipmentSchema
} from '../src/schemas.js';

const validShipment = {
  from: {
    suburb: 'SYDNEY',
    state: 'NSW',
    postcode: '2000'
  },
  to: {
    suburb: 'MELBOURNE',
    state: 'VIC',
    postcode: '3000'
  },
  items: [
    {
      product_id: 'T28S',
      length: 10,
      width: 10,
      height: 10,
      weight: 1
    }
  ]
};

test('trackItemsSchema enforces max 10 tracking IDs', () => {
  const ids = Array.from({ length: 11 }, (_, index) => `TRACK-${index}`);
  const parsed = trackItemsSchema.safeParse({ tracking_ids: ids });
  assert.equal(parsed.success, false);
});

test('getShipmentPriceSchema accepts single object and array shipments', () => {
  const single = getShipmentPriceSchema.safeParse({ shipments: validShipment });
  assert.equal(single.success, true);

  const multi = getShipmentPriceSchema.safeParse({
    shipments: [validShipment, validShipment]
  });
  assert.equal(multi.success, true);
});

test('createLabelsSchema accepts ZPL option field', () => {
  const parsed = createLabelsSchema.safeParse({
    shipment_ids: ['SHIP-1'],
    options: {
      format: 'ZPL',
      waitForLabelUrl: true
    }
  });
  assert.equal(parsed.success, true);
});

test('runFulfillmentFlowSchema validates allowed step values', () => {
  const parsed = runFulfillmentFlowSchema.safeParse({ step: 'price', shipments: [validShipment] });
  assert.equal(parsed.success, true);

  const invalid = runFulfillmentFlowSchema.safeParse({ step: 'unknown' });
  assert.equal(invalid.success, false);
});

test('shipment schemas reject flat origin/destination fields', () => {
  const parsed = getShipmentPriceSchema.safeParse({
    shipments: {
      origin_country: 'AU',
      origin_suburb: 'Sydney',
      origin_postcode: '2000',
      destination_country: 'AU',
      destination_suburb: 'Melbourne',
      destination_postcode: '3000',
      service: 'standard',
      weight: 1,
      length: 30,
      width: 20,
      height: 10
    }
  });

  assert.equal(parsed.success, false);
});

test('getItemPricesSchema requires structured data payload', () => {
  const parsed = getItemPricesSchema.safeParse({
    data: {
      from: { postcode: '3207' },
      to: { postcode: '2001' },
      items: [{ weight: 1 }]
    }
  });
  assert.equal(parsed.success, true);

  const invalid = getItemPricesSchema.safeParse({
    data: {
      origin_postcode: '3207',
      destination_postcode: '2001',
      weight: 1
    }
  });
  assert.equal(invalid.success, false);
});

test('updateShipmentSchema requires item_id in each item', () => {
  const parsed = updateShipmentSchema.safeParse({
    shipment_id: 'SHIP-1',
    data: {
      from: { suburb: 'SYDNEY', state: 'NSW', postcode: '2000' },
      to: { suburb: 'MELBOURNE', state: 'VIC', postcode: '3000' },
      items: [{ item_id: 'ITEM-1', product_id: 'T28S', length: 10, width: 10, height: 10, weight: 1 }]
    }
  });
  assert.equal(parsed.success, true);

  const invalid = updateShipmentSchema.safeParse({
    shipment_id: 'SHIP-1',
    data: {
      from: { suburb: 'SYDNEY', state: 'NSW', postcode: '2000' },
      to: { suburb: 'MELBOURNE', state: 'VIC', postcode: '3000' },
      items: [{ product_id: 'T28S', length: 10, width: 10, height: 10, weight: 1 }]
    }
  });
  assert.equal(invalid.success, false);
});
