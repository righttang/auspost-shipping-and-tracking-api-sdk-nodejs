import type { z } from 'zod';
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
  trackItemsSchema,
  updateShipmentSchema,
  validateShipmentSchema,
  validateSuburbSchema
} from '../schemas.js';
import type { AnyObject, CommonToolOutput, FulfillmentState, FulfillmentStep, SdkLike } from '../types.js';
import {
  extractArticleIds,
  extractLabelDetails,
  extractOrderId,
  extractShipmentIds,
  makeSuccessOutput,
  normalizeTrackingResponse,
  savePdfBuffer,
  toArray
} from '../helpers.js';
import { WorkflowStateStore, toStateResponse } from '../workflow-state.js';

class FlowPrerequisiteError extends Error {
  status = 400;
  code = 'FLOW_PREREQUISITE';

  constructor(message: string) {
    super(message);
    this.name = 'FlowPrerequisiteError';
  }
}

export type EmptyInput = z.infer<typeof emptySchema>;
export type ValidateSuburbInput = z.infer<typeof validateSuburbSchema>;
export type GetItemPricesInput = z.infer<typeof getItemPricesSchema>;
export type GetShipmentPriceInput = z.infer<typeof getShipmentPriceSchema>;
export type ValidateShipmentInput = z.infer<typeof validateShipmentSchema>;
export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type GetShipmentInput = z.infer<typeof getShipmentSchema>;
export type GetShipmentsInput = z.infer<typeof getShipmentsSchema>;
export type UpdateShipmentInput = z.infer<typeof updateShipmentSchema>;
export type DeleteShipmentInput = z.infer<typeof deleteShipmentSchema>;
export type CreateLabelsInput = z.infer<typeof createLabelsSchema>;
export type GetLabelInput = z.infer<typeof getLabelSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type GetOrderInput = z.infer<typeof getOrderSchema>;
export type GetOrderSummaryInput = z.infer<typeof getOrderSummarySchema>;
export type TrackItemsInput = z.infer<typeof trackItemsSchema>;
export type RunFulfillmentFlowInput = z.infer<typeof runFulfillmentFlowSchema>;
export type GetFulfillmentStateInput = z.infer<typeof getFulfillmentStateSchema>;

export interface ToolHandlers {
  auspost_get_account_details(input: EmptyInput): Promise<CommonToolOutput>;
  auspost_validate_suburb(input: ValidateSuburbInput): Promise<CommonToolOutput>;
  auspost_get_item_prices(input: GetItemPricesInput): Promise<CommonToolOutput>;
  auspost_get_shipment_price(input: GetShipmentPriceInput): Promise<CommonToolOutput>;
  auspost_validate_shipment(input: ValidateShipmentInput): Promise<CommonToolOutput>;
  auspost_create_shipment(input: CreateShipmentInput): Promise<CommonToolOutput>;
  auspost_get_shipment(input: GetShipmentInput): Promise<CommonToolOutput>;
  auspost_get_shipments(input: GetShipmentsInput): Promise<CommonToolOutput>;
  auspost_update_shipment(input: UpdateShipmentInput): Promise<CommonToolOutput>;
  auspost_delete_shipment(input: DeleteShipmentInput): Promise<CommonToolOutput>;
  auspost_create_labels(input: CreateLabelsInput): Promise<CommonToolOutput>;
  auspost_get_label(input: GetLabelInput): Promise<CommonToolOutput>;
  auspost_create_order(input: CreateOrderInput): Promise<CommonToolOutput>;
  auspost_get_order(input: GetOrderInput): Promise<CommonToolOutput>;
  auspost_get_order_summary(input: GetOrderSummaryInput): Promise<CommonToolOutput>;
  auspost_track_items(input: TrackItemsInput): Promise<CommonToolOutput>;
  auspost_run_fulfillment_flow(input: RunFulfillmentFlowInput): Promise<CommonToolOutput>;
  auspost_get_fulfillment_state(input: GetFulfillmentStateInput): Promise<CommonToolOutput>;
}

function nextFromState(state: FulfillmentState): string[] {
  switch (state.lastStep) {
    case 'price':
      return ['auspost_run_fulfillment_flow(step=create_shipment)'];
    case 'create_shipment':
      return [
        'auspost_run_fulfillment_flow(step=create_label)',
        'auspost_run_fulfillment_flow(step=create_order)'
      ];
    case 'create_label':
      return ['auspost_run_fulfillment_flow(step=create_order)'];
    case 'create_order':
      return ['auspost_run_fulfillment_flow(step=order_summary)'];
    case 'order_summary':
      return ['auspost_run_fulfillment_flow(step=track)'];
    case 'track':
      return [];
    default:
      return ['auspost_run_fulfillment_flow(step=price)'];
  }
}

function ensureShipmentIds(shipmentIds: string[] | undefined): string[] {
  if (!shipmentIds || shipmentIds.length === 0) {
    throw new FlowPrerequisiteError(
      'No shipment IDs available. Run step=create_shipment first or provide shipment_ids explicitly.'
    );
  }
  return shipmentIds;
}

function ensureOrderId(orderId: string | undefined): string {
  if (!orderId) {
    throw new FlowPrerequisiteError('No order ID available. Run step=create_order first or provide order_id.');
  }
  return orderId;
}

function ensureTrackingIds(trackingIds: string[] | undefined): string[] {
  if (!trackingIds || trackingIds.length === 0) {
    throw new FlowPrerequisiteError(
      'No tracking IDs available. Run step=create_shipment first or provide tracking_ids explicitly.'
    );
  }
  if (trackingIds.length > 10) {
    throw new FlowPrerequisiteError('Tracking API supports a maximum of 10 tracking IDs per request.');
  }
  return trackingIds;
}

function ensureLabelConstraints(shipmentIds: string[], options?: { format?: string }): void {
  const format = options?.format?.toUpperCase();
  if (format === 'ZPL' && shipmentIds.length > 50) {
    throw new FlowPrerequisiteError('ZPL label generation supports a maximum of 50 shipments per request.');
  }
}

export function createToolHandlers(sdk: SdkLike, store: WorkflowStateStore): ToolHandlers {
  return {
    async auspost_get_account_details(_input) {
      const result = (await sdk.shipping.getAccountDetails()) as AnyObject;
      return makeSuccessOutput('auspost_get_account_details', { result }, {}, ['auspost_create_shipment']);
    },

    async auspost_validate_suburb(input) {
      const result = (await sdk.shipping.validateSuburb(input.suburb, input.state, input.postcode)) as AnyObject;
      return makeSuccessOutput('auspost_validate_suburb', { result }, {}, ['auspost_create_shipment']);
    },

    async auspost_get_item_prices(input) {
      const result = (await sdk.shipping.getItemPrices(input.data)) as AnyObject;
      return makeSuccessOutput('auspost_get_item_prices', { result }, {}, ['auspost_get_shipment_price']);
    },

    async auspost_get_shipment_price(input) {
      const shipments = toArray(input.shipments) as AnyObject[];
      const result = (await sdk.shipping.getShipmentPrice({ shipments })) as AnyObject;
      return makeSuccessOutput('auspost_get_shipment_price', { result }, {}, ['auspost_create_shipment']);
    },

    async auspost_validate_shipment(input) {
      const result = (await sdk.shipping.validateShipment(input.shipments)) as AnyObject;
      return makeSuccessOutput('auspost_validate_shipment', { result }, {}, ['auspost_create_shipment']);
    },

    async auspost_create_shipment(input) {
      const result = (await sdk.shipping.createShipment(input.shipments)) as AnyObject;
      const shipmentIds = extractShipmentIds(result);
      const articleIds = extractArticleIds(result);

      return makeSuccessOutput(
        'auspost_create_shipment',
        { result },
        {
          ...(shipmentIds.length > 0 ? { shipment_ids: shipmentIds } : {}),
          ...(articleIds.length > 0 ? { article_ids: articleIds } : {})
        },
        ['auspost_create_labels', 'auspost_create_order']
      );
    },

    async auspost_get_shipment(input) {
      const result = (await sdk.shipping.getShipment(input.shipment_ids)) as AnyObject;
      return makeSuccessOutput('auspost_get_shipment', { result }, {}, ['auspost_create_labels', 'auspost_create_order']);
    },

    async auspost_get_shipments(input) {
      const result = (await sdk.shipping.getShipments({
        offset: input.offset,
        numberOfShipments: input.number_of_shipments,
        ...(input.status ? { status: input.status } : {}),
        ...(input.despatch_date ? { despatchDate: input.despatch_date } : {}),
        ...(input.sender_reference ? { senderReference: input.sender_reference } : {})
      })) as AnyObject;

      return makeSuccessOutput('auspost_get_shipments', { result }, {}, ['auspost_get_shipment']);
    },

    async auspost_update_shipment(input) {
      const result = (await sdk.shipping.updateShipment(input.shipment_id, input.data)) as AnyObject;
      return makeSuccessOutput('auspost_update_shipment', { result }, {}, ['auspost_create_labels', 'auspost_create_order']);
    },

    async auspost_delete_shipment(input) {
      const result = (await sdk.shipping.deleteShipment(input.shipment_ids)) as AnyObject;
      return makeSuccessOutput('auspost_delete_shipment', { result }, {}, ['auspost_create_shipment']);
    },

    async auspost_create_labels(input) {
      ensureLabelConstraints(input.shipment_ids, input.options);
      const result = (await sdk.shipping.createLabels(input.shipment_ids, input.options)) as AnyObject;
      const labels = extractLabelDetails(result);

      return makeSuccessOutput(
        'auspost_create_labels',
        { result },
        {
          ...(labels.labelRequestId ? { label_request_id: labels.labelRequestId } : {})
        },
        ['auspost_get_label', 'auspost_create_order']
      );
    },

    async auspost_get_label(input) {
      const result = (await sdk.shipping.getLabel(input.label_id)) as AnyObject;
      const details = extractLabelDetails(result);
      const nextActions =
        details.labelStatus === 'AVAILABLE' ? ['auspost_create_order'] : ['auspost_get_label(label_id=<same>)'];

      return makeSuccessOutput(
        'auspost_get_label',
        { result },
        {
          ...(details.labelRequestId ? { label_request_id: details.labelRequestId } : {})
        },
        nextActions
      );
    },

    async auspost_create_order(input) {
      const result = (await sdk.shipping.createOrder(input.shipment_ids, input.options)) as AnyObject;
      const orderId = extractOrderId(result);

      return makeSuccessOutput(
        'auspost_create_order',
        { result },
        {
          ...(orderId ? { order_id: orderId } : {})
        },
        ['auspost_get_order_summary', 'auspost_track_items']
      );
    },

    async auspost_get_order(input) {
      const result = (await sdk.shipping.getOrder(input.order_id)) as AnyObject;
      return makeSuccessOutput('auspost_get_order', { result }, { order_id: input.order_id }, ['auspost_get_order_summary']);
    },

    async auspost_get_order_summary(input) {
      const pdf = await sdk.shipping.getOrderSummary(input.order_id);
      const saved = await savePdfBuffer(pdf, input.order_id, input.output_path);

      return makeSuccessOutput(
        'auspost_get_order_summary',
        {
          artifact: {
            type: 'application/pdf',
            ...saved
          }
        },
        { order_id: input.order_id },
        ['auspost_track_items']
      );
    },

    async auspost_track_items(input) {
      const result = (await sdk.tracking.trackItems(input.tracking_ids)) as AnyObject;
      const normalized = normalizeTrackingResponse(result);

      return makeSuccessOutput('auspost_track_items', { result, normalized }, { article_ids: input.tracking_ids });
    },

    async auspost_run_fulfillment_flow(input) {
      const state = store.getOrCreate(input.workflow_id);
      const workflowId = state.workflowId;

      if (input.step === 'price') {
        const shipments = toArray(input.shipments ?? state.quotedShipments);
        if (!shipments || shipments.length === 0) {
          throw new FlowPrerequisiteError('step=price requires shipments payload or prior quoted shipments in workflow state.');
        }

        const result = (await sdk.shipping.getShipmentPrice({ shipments: shipments as AnyObject[] })) as AnyObject;
        const nextState = store.update(workflowId, (current) => ({
          ...current,
          quotedShipments: shipments as AnyObject[],
          lastStep: 'price'
        }));

        return makeSuccessOutput(
          'auspost_run_fulfillment_flow',
          {
            step: 'price',
            result,
            state: toStateResponse(nextState)
          },
          { workflow_id: workflowId },
          ['auspost_run_fulfillment_flow(step=create_shipment, workflow_id=<same>)']
        );
      }

      if (input.step === 'create_shipment') {
        const shipments = toArray(input.shipments ?? state.quotedShipments);
        if (!shipments || shipments.length === 0) {
          throw new FlowPrerequisiteError('step=create_shipment requires shipments payload or a prior step=price result.');
        }

        const result = (await sdk.shipping.createShipment(shipments as AnyObject[])) as AnyObject;
        const shipmentIds = extractShipmentIds(result);
        const articleIds = extractArticleIds(result);
        const nextState = store.update(workflowId, (current) => ({
          ...current,
          quotedShipments: shipments as AnyObject[],
          shipmentIds,
          articleIds,
          lastStep: 'create_shipment'
        }));

        return makeSuccessOutput(
          'auspost_run_fulfillment_flow',
          {
            step: 'create_shipment',
            result,
            state: toStateResponse(nextState)
          },
          {
            workflow_id: workflowId,
            ...(shipmentIds.length > 0 ? { shipment_ids: shipmentIds } : {}),
            ...(articleIds.length > 0 ? { article_ids: articleIds } : {})
          },
          [
            'auspost_run_fulfillment_flow(step=create_label, workflow_id=<same>)',
            'auspost_run_fulfillment_flow(step=create_order, workflow_id=<same>)'
          ]
        );
      }

      if (input.step === 'create_label') {
        const shipmentIds = ensureShipmentIds(input.shipment_ids ?? state.shipmentIds);
        ensureLabelConstraints(shipmentIds, input.label_options);

        const result = (await sdk.shipping.createLabels(shipmentIds, input.label_options)) as AnyObject;
        const details = extractLabelDetails(result);

        const nextState = store.update(workflowId, (current) => ({
          ...current,
          shipmentIds,
          labelRequestId: details.labelRequestId,
          labelStatus: details.labelStatus,
          labelUrl: details.labelUrl,
          lastStep: 'create_label'
        }));

        return makeSuccessOutput(
          'auspost_run_fulfillment_flow',
          {
            step: 'create_label',
            result,
            state: toStateResponse(nextState)
          },
          {
            workflow_id: workflowId,
            shipment_ids: shipmentIds,
            ...(details.labelRequestId ? { label_request_id: details.labelRequestId } : {})
          },
          ['auspost_run_fulfillment_flow(step=create_order, workflow_id=<same>)']
        );
      }

      if (input.step === 'create_order') {
        const shipmentIds = ensureShipmentIds(input.shipment_ids ?? state.shipmentIds);
        const result = (await sdk.shipping.createOrder(shipmentIds, input.order_options)) as AnyObject;
        const orderId = extractOrderId(result);

        const nextState = store.update(workflowId, (current) => ({
          ...current,
          shipmentIds,
          orderId: orderId ?? current.orderId,
          lastStep: 'create_order'
        }));

        return makeSuccessOutput(
          'auspost_run_fulfillment_flow',
          {
            step: 'create_order',
            result,
            state: toStateResponse(nextState)
          },
          {
            workflow_id: workflowId,
            shipment_ids: shipmentIds,
            ...(orderId ? { order_id: orderId } : {})
          },
          ['auspost_run_fulfillment_flow(step=order_summary, workflow_id=<same>)']
        );
      }

      if (input.step === 'order_summary') {
        const orderId = ensureOrderId(input.order_id ?? state.orderId);
        const pdf = await sdk.shipping.getOrderSummary(orderId);
        const saved = await savePdfBuffer(pdf, orderId, input.output_path);

        const nextState = store.update(workflowId, (current) => ({
          ...current,
          orderId,
          lastStep: 'order_summary'
        }));

        return makeSuccessOutput(
          'auspost_run_fulfillment_flow',
          {
            step: 'order_summary',
            artifact: {
              type: 'application/pdf',
              ...saved
            },
            state: toStateResponse(nextState)
          },
          {
            workflow_id: workflowId,
            order_id: orderId
          },
          ['auspost_run_fulfillment_flow(step=track, workflow_id=<same>)']
        );
      }

      if (input.step === 'track') {
        const trackingIds = ensureTrackingIds(input.tracking_ids ?? state.articleIds);
        const result = (await sdk.tracking.trackItems(trackingIds)) as AnyObject;
        const normalized = normalizeTrackingResponse(result);

        const nextState = store.update(workflowId, (current) => ({
          ...current,
          articleIds: trackingIds,
          lastStep: 'track'
        }));

        return makeSuccessOutput(
          'auspost_run_fulfillment_flow',
          {
            step: 'track',
            result,
            normalized,
            state: toStateResponse(nextState)
          },
          {
            workflow_id: workflowId,
            article_ids: trackingIds
          },
          []
        );
      }

      throw new FlowPrerequisiteError(`Unsupported workflow step '${input.step}'.`);
    },

    async auspost_get_fulfillment_state(input) {
      const state = store.get(input.workflow_id);
      if (!state) {
        throw new FlowPrerequisiteError(
          `workflow_id '${input.workflow_id}' was not found or has expired. Start with step=price to create a workflow.`
        );
      }

      return makeSuccessOutput(
        'auspost_get_fulfillment_state',
        {
          state: toStateResponse(state)
        },
        {
          workflow_id: state.workflowId,
          ...(state.shipmentIds ? { shipment_ids: state.shipmentIds } : {}),
          ...(state.articleIds ? { article_ids: state.articleIds } : {}),
          ...(state.labelRequestId ? { label_request_id: state.labelRequestId } : {}),
          ...(state.orderId ? { order_id: state.orderId } : {})
        },
        nextFromState(state)
      );
    }
  };
}

export function isWorkflowStep(step: string): step is FulfillmentStep {
  return [
    'price',
    'create_shipment',
    'create_label',
    'create_order',
    'order_summary',
    'track'
  ].includes(step);
}
