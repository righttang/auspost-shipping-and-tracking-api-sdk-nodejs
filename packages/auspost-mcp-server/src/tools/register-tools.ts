import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  createLabelsSchema,
  createOrderSchema,
  createShipmentSchema,
  deleteShipmentSchema,
  emptySchema,
  getFulfillmentStateSchema,
  getItemPricesSchema,
  getLabelSchema,
  getOrderSchema,
  getOrderSummarySchema,
  getShipmentPriceSchema,
  getShipmentSchema,
  getShipmentsSchema,
  runFulfillmentFlowSchema,
  toolOutputSchema,
  trackItemsSchema,
  updateShipmentSchema,
  validateShipmentSchema,
  validateSuburbSchema
} from '../schemas.js';
import { makeErrorOutput } from '../errors.js';
import { toToolResult } from '../helpers.js';
import type { ToolHandlers } from './handlers.js';

async function callHandler<T>(
  operation: string,
  handler: (input: T) => Promise<ReturnType<ToolHandlers[keyof ToolHandlers]> extends Promise<infer R> ? R : never>,
  input: T,
  prerequisiteHint?: string
) {
  try {
    const output = await handler(input);
    return toToolResult(output);
  } catch (error) {
    const mapped = makeErrorOutput(operation, error, prerequisiteHint);
    return toToolResult(mapped.output, mapped.isError);
  }
}

export function registerAuspostPrompt(server: McpServer): void {
  server.registerPrompt(
    'auspost_fulfillment_assistant',
    {
      title: 'AusPost Fulfillment Assistant',
      description:
        'Guides the agent through pricing -> shipment -> label -> order -> order summary -> tracking using AusPost tools.',
      argsSchema: {
        objective: z.string().optional().describe('Optional user objective to tailor the guidance')
      }
    },
    async ({ objective }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              'You are handling Australia Post fulfillment via MCP tools.',
              objective ? `Objective: ${objective}` : 'Objective: complete a standard shipment lifecycle.',
              'Preferred sequence:',
              '1) Use auspost_get_shipment_price to quote with surcharges.',
              '2) Use auspost_create_shipment to create shipment and capture shipment_ids/article_ids.',
              '3) Use auspost_create_labels (or workflow step=create_label) to generate labels.',
              '4) Use auspost_create_order from shipment_ids.',
              '5) Use auspost_get_order_summary to save PDF metadata (no inline binary).',
              '6) Use auspost_track_items with article_ids.',
              'When possible, use auspost_run_fulfillment_flow and auspost_get_fulfillment_state for guided execution and next_actions hints.'
            ].join('\n')
          }
        }
      ]
    })
  );
}

export function registerAuspostTools(server: McpServer, handlers: ToolHandlers): void {
  server.registerTool(
    'auspost_get_account_details',
    {
      title: 'AusPost Get Account Details',
      description:
        'Read account details and products. Use first to validate credentials/account. Typical follow-up: auspost_create_shipment.',
      inputSchema: emptySchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_get_account_details', handlers.auspost_get_account_details, input)
  );

  server.registerTool(
    'auspost_validate_suburb',
    {
      title: 'AusPost Validate Suburb',
      description:
        'Validate suburb/state/postcode before shipment creation. Typical follow-up: auspost_create_shipment.',
      inputSchema: validateSuburbSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_validate_suburb', handlers.auspost_validate_suburb, input)
  );

  server.registerTool(
    'auspost_get_item_prices',
    {
      title: 'AusPost Get Item Prices',
      description:
        'Get base item pricing excluding surcharges. Input data must be structured as { from: { postcode }, to: { postcode }, items: [{ weight, ... }] }. Typical follow-up: auspost_get_shipment_price.',
      inputSchema: getItemPricesSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_get_item_prices', handlers.auspost_get_item_prices, input)
  );

  server.registerTool(
    'auspost_get_shipment_price',
    {
      title: 'AusPost Get Shipment Price',
      description:
        'Get full shipment price including surcharges/fuel. Required pricing step before create_shipment in normal flow. shipments must use nested fields: from/to/items (not flat origin_* or destination_* keys).',
      inputSchema: getShipmentPriceSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_get_shipment_price', handlers.auspost_get_shipment_price, input)
  );

  server.registerTool(
    'auspost_validate_shipment',
    {
      title: 'AusPost Validate Shipment',
      description:
        'Validate shipment payload without creating records. shipments must use nested fields: from/to/items (not flat origin_* or destination_* keys). Typical follow-up: auspost_create_shipment.',
      inputSchema: validateShipmentSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_validate_shipment', handlers.auspost_validate_shipment, input)
  );

  server.registerTool(
    'auspost_create_shipment',
    {
      title: 'AusPost Create Shipment',
      description:
        'Create shipment(s) and return shipment_ids/article_ids. shipments must use nested fields: from/to/items (not flat origin_* or destination_* keys). Typical follow-up: auspost_create_labels or auspost_create_order.',
      inputSchema: createShipmentSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_create_shipment', handlers.auspost_create_shipment, input)
  );

  server.registerTool(
    'auspost_get_shipment',
    {
      title: 'AusPost Get Shipment',
      description: 'Get shipment details by one or more shipment IDs.',
      inputSchema: getShipmentSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_get_shipment', handlers.auspost_get_shipment, input)
  );

  server.registerTool(
    'auspost_get_shipments',
    {
      title: 'AusPost Get Shipments',
      description: 'List shipments with pagination and optional filters.',
      inputSchema: getShipmentsSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_get_shipments', handlers.auspost_get_shipments, input)
  );

  server.registerTool(
    'auspost_update_shipment',
    {
      title: 'AusPost Update Shipment',
      description:
        'Update an existing shipment by shipment_id. data must use nested from/to/items structure, and each item must include item_id.',
      inputSchema: updateShipmentSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_update_shipment', handlers.auspost_update_shipment, input)
  );

  server.registerTool(
    'auspost_delete_shipment',
    {
      title: 'AusPost Delete Shipment',
      description: 'Delete one or more shipments by shipment IDs.',
      inputSchema: deleteShipmentSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_delete_shipment', handlers.auspost_delete_shipment, input)
  );

  server.registerTool(
    'auspost_create_labels',
    {
      title: 'AusPost Create Labels',
      description:
        'Create label request for shipment_ids. Returns request_id/status/url metadata. Typical follow-up: auspost_get_label or auspost_create_order.',
      inputSchema: createLabelsSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_create_labels', handlers.auspost_create_labels, input)
  );

  server.registerTool(
    'auspost_get_label',
    {
      title: 'AusPost Get Label',
      description: 'Get label request status/details by label request_id.',
      inputSchema: getLabelSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_get_label', handlers.auspost_get_label, input)
  );

  server.registerTool(
    'auspost_create_order',
    {
      title: 'AusPost Create Order',
      description:
        'Create order from existing shipment_ids (PUT /orders). Typical follow-up: auspost_get_order_summary.',
      inputSchema: createOrderSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_create_order', handlers.auspost_create_order, input)
  );

  server.registerTool(
    'auspost_get_order',
    {
      title: 'AusPost Get Order',
      description: 'Get order details by order_id.',
      inputSchema: getOrderSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_get_order', handlers.auspost_get_order, input)
  );

  server.registerTool(
    'auspost_get_order_summary',
    {
      title: 'AusPost Get Order Summary',
      description:
        'Fetch order summary PDF by order_id and persist to local path. Returns metadata only (path/bytes/sha256).',
      inputSchema: getOrderSummarySchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_get_order_summary', handlers.auspost_get_order_summary, input)
  );

  server.registerTool(
    'auspost_track_items',
    {
      title: 'AusPost Track Items',
      description: 'Track up to 10 tracking IDs in a single request.',
      inputSchema: trackItemsSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (input) => callHandler('auspost_track_items', handlers.auspost_track_items, input)
  );

  server.registerTool(
    'auspost_run_fulfillment_flow',
    {
      title: 'AusPost Run Fulfillment Flow',
      description:
        'Guided workflow tool enforcing the normal lifecycle: price -> create_shipment -> create_label -> create_order -> order_summary -> track. If shipments are provided, use nested fields: from/to/items.',
      inputSchema: runFulfillmentFlowSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async (input) =>
      callHandler(
        'auspost_run_fulfillment_flow',
        handlers.auspost_run_fulfillment_flow,
        input,
        'Follow the sequence: price -> create_shipment -> create_label -> create_order -> order_summary -> track.'
      )
  );

  server.registerTool(
    'auspost_get_fulfillment_state',
    {
      title: 'AusPost Get Fulfillment State',
      description: 'Get saved in-memory state for a fulfillment workflow_id and recommended next action.',
      inputSchema: getFulfillmentStateSchema,
      outputSchema: toolOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (input) =>
      callHandler(
        'auspost_get_fulfillment_state',
        handlers.auspost_get_fulfillment_state,
        input,
        'Create a workflow first with auspost_run_fulfillment_flow(step=price).'
      )
  );
}
