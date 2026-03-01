export type AnyObject = Record<string, unknown>;

export interface SdkShipping {
  getAccountDetails(): Promise<AnyObject>;
  validateSuburb(suburb: string, state: string, postcode: string): Promise<AnyObject>;
  getItemPrices(data: AnyObject): Promise<AnyObject>;
  getShipmentPrice(data: { shipments: unknown[] }): Promise<AnyObject>;
  validateShipment(shipments: unknown[] | AnyObject): Promise<AnyObject>;
  createShipment(shipments: unknown[] | AnyObject): Promise<AnyObject>;
  getShipment(shipmentIds: string[] | string): Promise<AnyObject>;
  getShipments(options: {
    offset: number;
    numberOfShipments: number;
    status?: string;
    despatchDate?: string;
    senderReference?: string;
  }): Promise<AnyObject>;
  updateShipment(shipmentId: string, data: AnyObject): Promise<AnyObject>;
  deleteShipment(shipmentIds: string[] | string): Promise<AnyObject>;
  createLabels(shipmentIds: string[], options?: AnyObject): Promise<AnyObject>;
  getLabel(labelId: string): Promise<AnyObject>;
  createOrder(
    shipmentIds: string[],
    options?: {
      orderReference?: string;
      paymentMethod?: string;
      consignor?: string;
    }
  ): Promise<AnyObject>;
  getOrder(orderId: string): Promise<AnyObject>;
  getOrderSummary(orderId: string): Promise<Buffer>;
}

export interface SdkTracking {
  trackItems(trackingIds: string[] | string): Promise<AnyObject>;
}

export interface SdkLike {
  shipping: SdkShipping;
  tracking: SdkTracking;
}

export interface OperationIds {
  workflow_id?: string;
  shipment_ids?: string[];
  article_ids?: string[];
  label_request_id?: string;
  order_id?: string;
}

export interface CommonToolOutput {
  [key: string]: unknown;
  ok: boolean;
  operation: string;
  data: AnyObject;
  ids: OperationIds;
  next_actions: string[];
  warnings: string[];
  error?: {
    message: string;
    code?: string;
    status?: number;
    details?: unknown;
    retry_after_seconds?: number;
    suggested_actions: string[];
  };
}

export interface FulfillmentState {
  workflowId: string;
  createdAt: number;
  updatedAt: number;
  quotedShipments?: AnyObject[];
  shipmentIds?: string[];
  articleIds?: string[];
  labelRequestId?: string;
  labelUrl?: string;
  labelStatus?: string;
  orderId?: string;
  lastStep?: FulfillmentStep;
}

export type FulfillmentStep =
  | 'price'
  | 'create_shipment'
  | 'create_label'
  | 'create_order'
  | 'order_summary'
  | 'track';
