import test from 'node:test';
import assert from 'node:assert/strict';
import { WorkflowStateStore } from '../src/workflow-state.js';

test('WorkflowStateStore creates and retrieves state', () => {
  const store = new WorkflowStateStore();
  const created = store.create();
  const retrieved = store.get(created.workflowId);

  assert.ok(retrieved);
  assert.equal(retrieved?.workflowId, created.workflowId);
});

test('WorkflowStateStore updates state with timestamp progression', async () => {
  const store = new WorkflowStateStore();
  const created = store.create();

  await new Promise((resolve) => setTimeout(resolve, 2));

  const updated = store.update(created.workflowId, (current) => ({
    ...current,
    orderId: 'AP0001'
  }));

  assert.equal(updated.orderId, 'AP0001');
  assert.ok(updated.updatedAt >= created.updatedAt);
});

test('WorkflowStateStore expires stale records', async () => {
  const store = new WorkflowStateStore(1);
  const created = store.create();

  await new Promise((resolve) => setTimeout(resolve, 5));

  const result = store.get(created.workflowId);
  assert.equal(result, null);
});
