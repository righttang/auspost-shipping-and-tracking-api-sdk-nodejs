import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import type { CommonToolOutput, OperationIds } from './types.js';

export function makeSuccessOutput(
  operation: string,
  data: Record<string, unknown>,
  ids: OperationIds = {},
  nextActions: string[] = [],
  warnings: string[] = []
): CommonToolOutput {
  return {
    ok: true,
    operation,
    data,
    ids,
    next_actions: nextActions,
    warnings
  };
}

export function toToolResult(
  output: CommonToolOutput,
  isError = false
): {
  isError?: true;
  content: [{ type: 'text'; text: string }];
  structuredContent: CommonToolOutput;
} {
  return {
    ...(isError ? { isError: true as const } : {}),
    content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
    structuredContent: output
  };
}

export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export function extractShipmentIds(result: Record<string, unknown>): string[] {
  const shipments = Array.isArray(result.shipments) ? result.shipments : [];
  return shipments
    .map((shipment) => (shipment as Record<string, unknown>).shipment_id)
    .filter((id): id is string => typeof id === 'string');
}

export function extractArticleIds(result: Record<string, unknown>): string[] {
  const shipments = Array.isArray(result.shipments) ? result.shipments : [];
  const articleIds: string[] = [];

  for (const shipment of shipments) {
    const items = Array.isArray((shipment as Record<string, unknown>).items)
      ? ((shipment as Record<string, unknown>).items as Record<string, unknown>[])
      : [];

    for (const item of items) {
      const details = item.tracking_details as Record<string, unknown> | undefined;
      const articleId = details?.article_id;
      if (typeof articleId === 'string') {
        articleIds.push(articleId);
      }
    }
  }

  return articleIds;
}

export function extractLabelDetails(result: Record<string, unknown>): {
  labelRequestId?: string;
  labelStatus?: string;
  labelUrl?: string;
} {
  const labels = Array.isArray(result.labels) ? result.labels : [];
  const first = labels[0] as Record<string, unknown> | undefined;
  if (!first) return {};

  const requestId = typeof first.request_id === 'string' ? first.request_id : undefined;
  const status = typeof first.status === 'string' ? first.status : undefined;
  const url =
    typeof first.url === 'string'
      ? first.url
      : typeof first.label_url === 'string'
        ? first.label_url
        : undefined;

  return {
    ...(requestId ? { labelRequestId: requestId } : {}),
    ...(status ? { labelStatus: status } : {}),
    ...(url ? { labelUrl: url } : {})
  };
}

export function extractOrderId(result: Record<string, unknown>): string | undefined {
  const order = result.order as Record<string, unknown> | undefined;
  if (order && typeof order.order_id === 'string') {
    return order.order_id;
  }
  return undefined;
}

export async function savePdfBuffer(
  buffer: Buffer,
  orderId: string,
  outputPath?: string
): Promise<{ path: string; bytes: number; sha256: string }> {
  const timestamp = Date.now();
  const destination = outputPath ?? join(tmpdir(), 'auspost', `order-summary-${orderId}-${timestamp}.pdf`);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, buffer);

  const sha256 = createHash('sha256').update(buffer).digest('hex');
  return {
    path: destination,
    bytes: buffer.byteLength,
    sha256
  };
}

export function normalizeTrackingResponse(result: Record<string, unknown>): {
  statuses: Array<{ tracking_id: string; status: string }>;
  events_by_tracking_id: Record<string, Array<{ description: string; date?: string; location?: string }>>;
} {
  const trackingResults = Array.isArray(result.tracking_results)
    ? (result.tracking_results as Record<string, unknown>[])
    : [];

  const statuses: Array<{ tracking_id: string; status: string }> = [];
  const eventsByTrackingId: Record<string, Array<{ description: string; date?: string; location?: string }>> = {};

  for (const row of trackingResults) {
    const trackingId = typeof row.tracking_id === 'string' ? row.tracking_id : 'unknown';
    const status = typeof row.status === 'string' ? row.status : 'Unknown';
    statuses.push({ tracking_id: trackingId, status });

    const trackableItems = Array.isArray(row.trackable_items)
      ? (row.trackable_items as Record<string, unknown>[])
      : [];

    const events: Array<{ description: string; date?: string; location?: string }> = [];

    for (const item of trackableItems) {
      const itemEvents = Array.isArray(item.events) ? (item.events as Record<string, unknown>[]) : [];
      for (const event of itemEvents) {
        const description = typeof event.description === 'string' ? event.description : 'Unknown';
        events.push({
          description,
          ...(typeof event.date === 'string' ? { date: event.date } : {}),
          ...(typeof event.location === 'string' ? { location: event.location } : {})
        });
      }
    }

    eventsByTrackingId[trackingId] = events;
  }

  return {
    statuses,
    events_by_tracking_id: eventsByTrackingId
  };
}
