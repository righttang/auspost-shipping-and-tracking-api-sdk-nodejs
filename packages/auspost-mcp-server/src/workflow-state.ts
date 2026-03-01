import { randomUUID } from 'node:crypto';
import type { FulfillmentState } from './types.js';

const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000;

export class WorkflowStateStore {
  private readonly states = new Map<string, FulfillmentState>();

  constructor(private readonly ttlMs: number = DEFAULT_TTL_MS) {}

  private pruneExpired(): void {
    const now = Date.now();
    for (const [workflowId, state] of this.states.entries()) {
      if (now - state.updatedAt > this.ttlMs) {
        this.states.delete(workflowId);
      }
    }
  }

  create(): FulfillmentState {
    this.pruneExpired();
    const now = Date.now();
    const workflowId = randomUUID();
    const state: FulfillmentState = {
      workflowId,
      createdAt: now,
      updatedAt: now
    };
    this.states.set(workflowId, state);
    return state;
  }

  get(workflowId: string): FulfillmentState | null {
    this.pruneExpired();
    return this.states.get(workflowId) ?? null;
  }

  getOrCreate(workflowId?: string): FulfillmentState {
    if (!workflowId) {
      return this.create();
    }

    const existing = this.get(workflowId);
    if (existing) {
      return existing;
    }

    const now = Date.now();
    const created: FulfillmentState = {
      workflowId,
      createdAt: now,
      updatedAt: now
    };
    this.states.set(workflowId, created);
    return created;
  }

  update(workflowId: string, updater: (current: FulfillmentState) => FulfillmentState): FulfillmentState {
    const current = this.getOrCreate(workflowId);
    const next = {
      ...updater(current),
      workflowId,
      createdAt: current.createdAt,
      updatedAt: Date.now()
    };
    this.states.set(workflowId, next);
    return next;
  }

  clear(): void {
    this.states.clear();
  }
}

export function toStateResponse(state: FulfillmentState): {
  workflow_id: string;
  created_at: string;
  updated_at: string;
  last_step?: string;
  shipment_ids: string[];
  article_ids: string[];
  label_request_id?: string;
  label_url?: string;
  label_status?: string;
  order_id?: string;
} {
  return {
    workflow_id: state.workflowId,
    created_at: new Date(state.createdAt).toISOString(),
    updated_at: new Date(state.updatedAt).toISOString(),
    ...(state.lastStep ? { last_step: state.lastStep } : {}),
    shipment_ids: state.shipmentIds ?? [],
    article_ids: state.articleIds ?? [],
    ...(state.labelRequestId ? { label_request_id: state.labelRequestId } : {}),
    ...(state.labelUrl ? { label_url: state.labelUrl } : {}),
    ...(state.labelStatus ? { label_status: state.labelStatus } : {}),
    ...(state.orderId ? { order_id: state.orderId } : {})
  };
}
