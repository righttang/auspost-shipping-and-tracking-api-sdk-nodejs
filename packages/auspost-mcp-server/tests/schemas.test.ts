import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createLabelsSchema,
  getShipmentPriceSchema,
  runFulfillmentFlowSchema,
  trackItemsSchema
} from '../src/schemas.js';

test('trackItemsSchema enforces max 10 tracking IDs', () => {
  const ids = Array.from({ length: 11 }, (_, index) => `TRACK-${index}`);
  const parsed = trackItemsSchema.safeParse({ tracking_ids: ids });
  assert.equal(parsed.success, false);
});

test('getShipmentPriceSchema accepts single object and array shipments', () => {
  const single = getShipmentPriceSchema.safeParse({ shipments: { from: {}, to: {}, items: [] } });
  assert.equal(single.success, true);

  const multi = getShipmentPriceSchema.safeParse({
    shipments: [{ from: {}, to: {}, items: [] }, { from: {}, to: {}, items: [] }]
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
  const parsed = runFulfillmentFlowSchema.safeParse({ step: 'price', shipments: [{ from: {}, to: {}, items: [] }] });
  assert.equal(parsed.success, true);

  const invalid = runFulfillmentFlowSchema.safeParse({ step: 'unknown' });
  assert.equal(invalid.success, false);
});
