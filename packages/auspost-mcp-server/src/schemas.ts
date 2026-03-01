import { z } from 'zod';

const anyRecord = z.record(z.any());
const stateCodeSchema = z.enum(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']);
const postcodeSchema = z.string().regex(/^\d{4}$/, 'postcode must be 4 digits');

const shipmentAddressSchema = z
  .object({
    name: z.string().min(1).optional().describe('Contact name'),
    business_name: z.string().min(1).optional().describe('Business name'),
    lines: z.array(z.string().min(1)).min(1).max(3).optional().describe('Address lines'),
    suburb: z.string().min(1).describe('Suburb/locality'),
    state: stateCodeSchema.describe('State code: ACT, NSW, NT, QLD, SA, TAS, VIC, WA'),
    postcode: postcodeSchema.describe('4-digit postcode'),
    country: z.string().min(2).max(3).optional().describe('Optional country code (e.g. AU)'),
    phone: z.string().min(1).optional(),
    email: z.string().email().optional()
  })
  .strict();

const itemPriceAddressSchema = z
  .object({
    postcode: postcodeSchema.describe('4-digit postcode'),
    suburb: z.string().min(1).optional().describe('Optional suburb (required for some StarTrack products)'),
    country: z.string().length(2).optional().describe('ISO country code, defaults to AU')
  })
  .strict();

const shipmentItemSchema = z
  .object({
    item_reference: z.string().min(1).optional(),
    product_id: z.string().min(1).describe('AusPost product code (e.g. T28S)'),
    length: z.coerce.number().positive().describe('Length in cm'),
    width: z.coerce.number().positive().describe('Width in cm'),
    height: z.coerce.number().positive().describe('Height in cm'),
    weight: z.coerce.number().positive().describe('Weight in kg'),
    authority_to_leave: z.boolean().optional(),
    allow_partial_delivery: z.boolean().optional(),
    contains_dangerous_goods: z.boolean().optional(),
    packaging_type: z.string().max(3).optional(),
    features: z.record(z.any()).optional()
  })
  .strict();

const itemPriceItemSchema = z
  .object({
    item_reference: z.string().max(50).optional(),
    length: z.coerce.number().positive().optional().describe('Length in cm'),
    width: z.coerce.number().positive().optional().describe('Width in cm'),
    height: z.coerce.number().positive().optional().describe('Height in cm'),
    weight: z.coerce.number().positive().describe('Weight in kg'),
    packaging_type: z.string().max(3).optional(),
    product_ids: z.array(z.string().min(1)).optional(),
    features: z.record(z.any()).optional()
  })
  .strict();

const updateShipmentItemSchema = shipmentItemSchema
  .extend({
    item_id: z.string().min(1).describe('Existing item ID from create_shipment response')
  })
  .strict();

const updateShipmentPayloadSchema = z
  .object({
    shipment_reference: z.string().max(50).optional(),
    customer_reference_1: z.string().max(50).optional(),
    customer_reference_2: z.string().max(50).optional(),
    from: shipmentAddressSchema.describe('Sender address object'),
    to: shipmentAddressSchema.describe('Recipient address object'),
    items: z.array(updateShipmentItemSchema).min(1).describe('Items to update (must include item_id)')
  })
  .strict()
  .describe(
    'Shipment update body must use nested fields: from/to/items. Each item must include item_id plus product_id and parcel dimensions/weight.'
  );

const flatShipmentKeys = [
  'origin_country',
  'origin_suburb',
  'origin_postcode',
  'destination_country',
  'destination_suburb',
  'destination_postcode',
  'service'
] as const;

const structuredShipmentHint =
  'Shipments must use nested fields: { from: {...}, to: {...}, items: [{ product_id, length, width, height, weight }] }. Flat keys like origin_postcode/destination_postcode are not supported.';

const shipmentPayload = z
  .object({
    shipment_reference: z.string().max(50).optional(),
    customer_reference_1: z.string().max(50).optional(),
    customer_reference_2: z.string().max(50).optional(),
    from: shipmentAddressSchema.describe('Sender address object'),
    to: shipmentAddressSchema.describe('Recipient address object'),
    items: z.array(shipmentItemSchema).min(1).describe('One or more shipment items')
  })
  .strict()
  .superRefine((shipment, context) => {
    const detectedFlatKeys = flatShipmentKeys.filter((field) => field in shipment);
    if (detectedFlatKeys.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unsupported flat shipment fields detected: ${detectedFlatKeys.join(', ')}. ${structuredShipmentHint}`
      });
    }
  })
  .describe(structuredShipmentHint);

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
    state: stateCodeSchema,
    postcode: postcodeSchema
  })
  .strict();

export const getItemPricesSchema = z
  .object({
    data: z
      .object({
        from: itemPriceAddressSchema.describe('Origin address'),
        to: itemPriceAddressSchema.describe('Destination address'),
        items: z.array(itemPriceItemSchema).min(1).max(20).describe('Items to price')
      })
      .strict()
      .describe('Structured request body for /prices/items')
  })
  .strict();

export const shipmentArraySchema = z.array(shipmentPayload).min(1);

export const getShipmentPriceSchema = z
  .object({
    shipments: z.union([shipmentPayload, shipmentArraySchema]).describe(structuredShipmentHint)
  })
  .strict();

export const validateShipmentSchema = z
  .object({
    shipments: z.union([shipmentPayload, shipmentArraySchema]).describe(structuredShipmentHint)
  })
  .strict();

export const createShipmentSchema = z
  .object({
    shipments: z.union([shipmentPayload, shipmentArraySchema]).describe(structuredShipmentHint)
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
    data: updateShipmentPayloadSchema
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
      .strict()
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
    shipments: z.union([shipmentPayload, shipmentArraySchema]).describe(structuredShipmentHint).optional(),
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
