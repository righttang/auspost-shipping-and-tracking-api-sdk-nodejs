import { z } from 'zod';

const anyRecord = z.record(z.any());
const shipmentPayload = anyRecord;

export const toolOutputSchema = {
  ok: z.boolean(),
  operation: z.string(),
  data: anyRecord,
  ids: z
    .object({
      workflow_id: z.string().optional(),
      shipment_ids: z.array(z.string()).optional(),
      article_ids: z.array(z.string()).optional(),
      label_request_id: z.string().optional(),
      order_id: z.string().optional()
    })
    .default({}),
  next_actions: z.array(z.string()),
  warnings: z.array(z.string()),
  error: z
    .object({
      message: z.string(),
      code: z.string().optional(),
      status: z.number().optional(),
      details: z.any().optional(),
      retry_after_seconds: z.number().optional(),
      suggested_actions: z.array(z.string())
    })
    .optional()
};

export const emptySchema = z.object({});

export const validateSuburbSchema = z
  .object({
    suburb: z.string().min(1),
    state: z.enum(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']),
    postcode: z.string().regex(/^\d{4}$/, 'postcode must be 4 digits')
  })
  .strict();

export const getItemPricesSchema = z
  .object({
    data: anyRecord
      .refine((value) => 'from' in value && 'to' in value && 'items' in value, 'data must include from, to, and items')
      .describe('Request body for /prices/items')
  })
  .strict();

export const shipmentArraySchema = z.array(shipmentPayload).min(1);

export const getShipmentPriceSchema = z
  .object({
    shipments: z.union([shipmentPayload, shipmentArraySchema])
  })
  .strict();

export const validateShipmentSchema = z
  .object({
    shipments: z.union([shipmentPayload, shipmentArraySchema])
  })
  .strict();

export const createShipmentSchema = z
  .object({
    shipments: z.union([shipmentPayload, shipmentArraySchema])
  })
  .strict();

export const getShipmentSchema = z
  .object({
    shipment_ids: z.array(z.string().min(1)).min(1)
  })
  .strict();

export const getShipmentsSchema = z
  .object({
    offset: z.number().int().min(0),
    number_of_shipments: z.number().int().min(1),
    status: z.string().optional(),
    despatch_date: z.string().optional(),
    sender_reference: z.string().optional()
  })
  .strict();

export const updateShipmentSchema = z
  .object({
    shipment_id: z.string().min(1),
    data: anyRecord
  })
  .strict();

export const deleteShipmentSchema = z
  .object({
    shipment_ids: z.array(z.string().min(1)).min(1)
  })
  .strict();

export const createLabelsSchema = z
  .object({
    shipment_ids: z.array(z.string().min(1)).min(1),
    options: z
      .object({
        group: z.string().optional(),
        layout: z.string().optional(),
        branded: z.boolean().optional(),
        leftOffset: z.number().optional(),
        topOffset: z.number().optional(),
        format: z.enum(['PDF', 'ZPL']).optional(),
        waitForLabelUrl: z.boolean().optional()
      })
      .passthrough()
      .optional()
  })
  .strict();

export const getLabelSchema = z
  .object({
    label_id: z.string().min(1)
  })
  .strict();

export const createOrderSchema = z
  .object({
    shipment_ids: z.array(z.string().min(1)).min(1),
    options: z
      .object({
        orderReference: z.string().optional(),
        paymentMethod: z.string().optional(),
        consignor: z.string().optional()
      })
      .strict()
      .optional()
  })
  .strict();

export const getOrderSchema = z
  .object({
    order_id: z.string().min(1)
  })
  .strict();

export const getOrderSummarySchema = z
  .object({
    order_id: z.string().min(1),
    output_path: z.string().optional()
  })
  .strict();

export const trackItemsSchema = z
  .object({
    tracking_ids: z.array(z.string().min(1)).min(1).max(10)
  })
  .strict();

export const fulfillmentStepSchema = z.enum([
  'price',
  'create_shipment',
  'create_label',
  'create_order',
  'order_summary',
  'track'
]);

export const runFulfillmentFlowSchema = z
  .object({
    step: fulfillmentStepSchema,
    workflow_id: z.string().optional(),
    shipments: z.union([shipmentPayload, shipmentArraySchema]).optional(),
    shipment_ids: z.array(z.string().min(1)).optional(),
    label_options: createLabelsSchema.shape.options.optional(),
    order_options: createOrderSchema.shape.options.optional(),
    order_id: z.string().optional(),
    output_path: z.string().optional(),
    tracking_ids: z.array(z.string().min(1)).max(10).optional()
  })
  .strict();

export const getFulfillmentStateSchema = z
  .object({
    workflow_id: z.string().min(1)
  })
  .strict();
