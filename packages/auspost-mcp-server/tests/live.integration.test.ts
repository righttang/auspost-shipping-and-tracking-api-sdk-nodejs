import test from 'node:test';
import assert from 'node:assert/strict';

const liveEnabled = process.env.AUSPOST_LIVE === '1';
const hasCredentials =
  !!process.env.AUSPOST_API_KEY &&
  !!process.env.AUSPOST_API_PASSWORD &&
  !!process.env.AUSPOST_ACCOUNT_NUMBER;

const describeLive = liveEnabled && hasCredentials ? test : test.skip;

describeLive('live happy path: pricing -> shipment -> label -> order -> summary -> tracking', async () => {
  const { getSdkClient } = await import('../src/sdk-client.js');
  const { createToolHandlers } = await import('../src/tools/handlers.js');
  const { WorkflowStateStore } = await import('../src/workflow-state.js');

  const sdk = getSdkClient();
  const handlers = createToolHandlers(sdk, new WorkflowStateStore());

  const shipmentPayload = {
    shipment_reference: `MCP-LIVE-${Date.now()}`,
    from: {
      name: 'Live Sender',
      lines: ['123 Test St'],
      suburb: 'SYDNEY',
      state: 'NSW',
      postcode: '2000',
      country: 'AU'
    },
    to: {
      name: 'Live Recipient',
      lines: ['456 Demo Rd'],
      suburb: 'MELBOURNE',
      state: 'VIC',
      postcode: '3000',
      country: 'AU'
    },
    items: [
      {
        item_reference: 'ITEM-1',
        product_id: '7E55',
        length: 10,
        width: 10,
        height: 10,
        weight: 1,
        authority_to_leave: true
      }
    ]
  };

  const priced = await handlers.auspost_run_fulfillment_flow({
    step: 'price',
    shipments: shipmentPayload
  });
  assert.equal(priced.ok, true);

  const workflowId = priced.ids.workflow_id;
  assert.ok(workflowId);

  const created = await handlers.auspost_run_fulfillment_flow({
    step: 'create_shipment',
    workflow_id: workflowId
  });
  assert.equal(created.ok, true);

  const shipmentIds = created.ids.shipment_ids ?? [];
  assert.ok(shipmentIds.length > 0);

  const labeled = await handlers.auspost_run_fulfillment_flow({
    step: 'create_label',
    workflow_id: workflowId
  });
  assert.equal(labeled.ok, true);

  const ordered = await handlers.auspost_run_fulfillment_flow({
    step: 'create_order',
    workflow_id: workflowId
  });
  assert.equal(ordered.ok, true);

  const orderId = ordered.ids.order_id;
  assert.ok(orderId);

  const summary = await handlers.auspost_run_fulfillment_flow({
    step: 'order_summary',
    workflow_id: workflowId
  });
  assert.equal(summary.ok, true);

  const tracked = await handlers.auspost_run_fulfillment_flow({
    step: 'track',
    workflow_id: workflowId
  });
  assert.equal(tracked.ok, true);
});
