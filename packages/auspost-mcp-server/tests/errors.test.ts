import test from 'node:test';
import assert from 'node:assert/strict';
import { mapSdkError } from '../src/errors.js';

test('mapSdkError maps rate limit errors with retry guidance', () => {
  const error = new Error('Rate limit exceeded') as Error & {
    status: number;
    retryAfter: number;
  };
  error.status = 429;
  error.retryAfter = 12;

  const mapped = mapSdkError(error, { operation: 'auspost_track_items' });

  assert.equal(mapped.status, 429);
  assert.equal(mapped.retry_after_seconds, 12);
  assert.ok(mapped.suggested_actions.some((item) => item.includes('Retry')));
});

test('mapSdkError maps auth failures with environment suggestion', () => {
  const error = new Error('Unauthorized') as Error & { status: number };
  error.status = 401;

  const mapped = mapSdkError(error, { operation: 'auspost_get_account_details' });

  assert.equal(mapped.status, 401);
  assert.ok(mapped.suggested_actions.some((item) => item.includes('AUSPOST_API_KEY')));
});

test('mapSdkError includes prerequisite hint when provided', () => {
  const mapped = mapSdkError(new Error('missing state'), {
    operation: 'auspost_run_fulfillment_flow',
    prerequisiteHint: 'Run step=price first'
  });

  assert.ok(mapped.suggested_actions.includes('Run step=price first'));
});
