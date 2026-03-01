import test from 'node:test';
import assert from 'node:assert/strict';
import { access, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createToolHandlers } from '../src/tools/handlers.js';
import { WorkflowStateStore } from '../src/workflow-state.js';

function createMockSdk() {
  const calls: Array<{ method: string; args: unknown[] }> = [];

  const sdk = {
    shipping: {
      async getAccountDetails() {
        calls.push({ method: 'shipping.getAccountDetails', args: [] });
        return { account_number: '0000000001' };
      },
      async validateSuburb(suburb: string, state: string, postcode: string) {
        calls.push({ method: 'shipping.validateSuburb', args: [suburb, state, postcode] });
        return { found: true };
      },
      async getItemPrices(data: unknown) {
        calls.push({ method: 'shipping.getItemPrices', args: [data] });
        return { items: [] };
      },
      async getShipmentPrice(data: unknown) {
        calls.push({ method: 'shipping.getShipmentPrice', args: [data] });
        return {
          shipments: [{ shipment_summary: { total_cost: 12.34, fuel_surcharge: 0.4 } }]
        };
      },
      async validateShipment(shipments: unknown) {
        calls.push({ method: 'shipping.validateShipment', args: [shipments] });
        return { valid: true };
      },
      async createShipment(shipments: unknown) {
        calls.push({ method: 'shipping.createShipment', args: [shipments] });
        return {
          shipments: [
            {
              shipment_id: 'SHIP-1',
              items: [{ tracking_details: { article_id: 'ART-1' } }]
            }
          ]
        };
      },
      async getShipment(shipmentIds: unknown) {
        calls.push({ method: 'shipping.getShipment', args: [shipmentIds] });
        return { shipments: [{ shipment_id: 'SHIP-1' }] };
      },
      async getShipments(options: unknown) {
        calls.push({ method: 'shipping.getShipments', args: [options] });
        return { shipments: [] };
      },
      async updateShipment(shipmentId: unknown, data: unknown) {
        calls.push({ method: 'shipping.updateShipment', args: [shipmentId, data] });
        return { shipments: [{ shipment_id: shipmentId }] };
      },
      async deleteShipment(shipmentIds: unknown) {
        calls.push({ method: 'shipping.deleteShipment', args: [shipmentIds] });
        return { deleted: true };
      },
      async createLabels(shipmentIds: unknown, options: unknown) {
        calls.push({ method: 'shipping.createLabels', args: [shipmentIds, options] });
        return {
          labels: [{ request_id: 'REQ-1', status: 'AVAILABLE', url: 'https://example.test/label.pdf' }]
        };
      },
      async getLabel(labelId: unknown) {
        calls.push({ method: 'shipping.getLabel', args: [labelId] });
        return {
          labels: [{ request_id: labelId, status: 'AVAILABLE', url: 'https://example.test/label.pdf' }]
        };
      },
      async createOrder(shipmentIds: unknown, options: unknown) {
        calls.push({ method: 'shipping.createOrder', args: [shipmentIds, options] });
        return { order: { order_id: 'AP-1' } };
      },
      async getOrder(orderId: unknown) {
        calls.push({ method: 'shipping.getOrder', args: [orderId] });
        return { order: { order_id: orderId } };
      },
      async getOrderSummary(orderId: unknown) {
        calls.push({ method: 'shipping.getOrderSummary', args: [orderId] });
        return Buffer.from('%PDF-1.4 mocked');
      }
    },
    tracking: {
      async trackItems(trackingIds: unknown) {
        calls.push({ method: 'tracking.trackItems', args: [trackingIds] });
        return {
          tracking_results: [
            {
              tracking_id: Array.isArray(trackingIds) ? trackingIds[0] : 'ART-1',
              status: 'Delivered',
              trackable_items: [
                {
                  events: [
                    { description: 'Delivered', date: '2025-01-01T00:00:00+10:00', location: 'MELBOURNE' }
                  ]
                }
              ]
            }
          ]
        };
      }
    }
  };

  return { sdk, calls };
}

test('atomic create_shipment returns ids and calls SDK', async () => {
  const { sdk, calls } = createMockSdk();
  const handlers = createToolHandlers(sdk as never, new WorkflowStateStore());

  const output = await handlers.auspost_create_shipment({ shipments: { from: {}, to: {}, items: [] } });

  assert.equal(output.ok, true);
  assert.deepEqual(output.ids.shipment_ids, ['SHIP-1']);
  assert.deepEqual(output.ids.article_ids, ['ART-1']);
  assert.equal(calls[0]?.method, 'shipping.createShipment');
});

test('atomic create_order passes shipment IDs and options', async () => {
  const { sdk, calls } = createMockSdk();
  const handlers = createToolHandlers(sdk as never, new WorkflowStateStore());

  const output = await handlers.auspost_create_order({
    shipment_ids: ['SHIP-1', 'SHIP-2'],
    options: { orderReference: 'ORDER-1' }
  });

  assert.equal(output.ok, true);
  assert.equal(output.ids.order_id, 'AP-1');
  const call = calls.find((item) => item.method === 'shipping.createOrder');
  assert.ok(call);
  assert.deepEqual(call?.args[0], ['SHIP-1', 'SHIP-2']);
  assert.deepEqual(call?.args[1], { orderReference: 'ORDER-1' });
});

test('atomic get_order_summary writes artifact metadata', async () => {
  const { sdk } = createMockSdk();
  const handlers = createToolHandlers(sdk as never, new WorkflowStateStore());
  const path = join(tmpdir(), 'auspost-mcp-test-order-summary.pdf');

  const output = await handlers.auspost_get_order_summary({ order_id: 'AP-1', output_path: path });

  assert.equal(output.ok, true);
  const artifact = output.data.artifact as Record<string, unknown>;
  assert.equal(artifact.path, path);
  assert.equal(typeof artifact.sha256, 'string');
  await access(path);
  await rm(path, { force: true });
});

test('atomic track_items normalizes tracking response', async () => {
  const { sdk } = createMockSdk();
  const handlers = createToolHandlers(sdk as never, new WorkflowStateStore());

  const output = await handlers.auspost_track_items({ tracking_ids: ['ART-1'] });

  assert.equal(output.ok, true);
  const normalized = output.data.normalized as Record<string, unknown>;
  assert.ok(Array.isArray(normalized.statuses));
});

test('workflow enforces prerequisites for create_order step', async () => {
  const { sdk } = createMockSdk();
  const handlers = createToolHandlers(sdk as never, new WorkflowStateStore());

  await assert.rejects(
    handlers.auspost_run_fulfillment_flow({
      step: 'create_order'
    }),
    /No shipment IDs available/
  );
});

test('workflow happy path stores and reuses IDs', async () => {
  const { sdk } = createMockSdk();
  const store = new WorkflowStateStore();
  const handlers = createToolHandlers(sdk as never, store);

  const priced = await handlers.auspost_run_fulfillment_flow({
    step: 'price',
    shipments: { from: {}, to: {}, items: [] }
  });

  const workflowId = priced.ids.workflow_id;
  assert.ok(workflowId);

  const created = await handlers.auspost_run_fulfillment_flow({
    step: 'create_shipment',
    workflow_id: workflowId
  });

  assert.deepEqual(created.ids.shipment_ids, ['SHIP-1']);

  const ordered = await handlers.auspost_run_fulfillment_flow({
    step: 'create_order',
    workflow_id: workflowId
  });

  assert.equal(ordered.ids.order_id, 'AP-1');

  const state = await handlers.auspost_get_fulfillment_state({ workflow_id: workflowId! });
  assert.equal(state.ids.workflow_id, workflowId);
  assert.ok(state.next_actions.length >= 1);
});
