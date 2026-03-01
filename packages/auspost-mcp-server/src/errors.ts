import type { CommonToolOutput } from './types.js';

export interface MappedToolError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
  retry_after_seconds?: number;
  suggested_actions: string[];
}

export interface ErrorContext {
  operation: string;
  prerequisiteHint?: string;
}

function normalizeError(error: unknown): {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
  retryAfter?: number;
  name?: string;
} {
  if (error instanceof Error) {
    const err = error as Error & {
      code?: string;
      status?: number;
      details?: unknown;
      retryAfter?: number;
      retry_after?: number;
    };

    return {
      message: err.message,
      code: err.code,
      status: err.status,
      details: err.details,
      retryAfter: err.retryAfter ?? err.retry_after,
      name: err.name
    };
  }

  return {
    message: 'Unknown error occurred while calling Australia Post API.'
  };
}

export function mapSdkError(error: unknown, context: ErrorContext): MappedToolError {
  const normalized = normalizeError(error);
  const suggestedActions: string[] = [];

  if (context.prerequisiteHint) {
    suggestedActions.push(context.prerequisiteHint);
  }

  if (normalized.status === 429) {
    suggestedActions.push('Retry this tool after waiting for the retry window.');
  } else if (normalized.status === 401 || normalized.status === 403) {
    suggestedActions.push('Check AUSPOST_API_KEY, AUSPOST_API_PASSWORD, and AUSPOST_ACCOUNT_NUMBER environment variables.');
  } else if (normalized.status === 400 || normalized.name === 'ValidationError') {
    suggestedActions.push('Check required fields and payload structure for this tool call.');
  } else if (normalized.status === 404) {
    suggestedActions.push('Verify the provided resource ID exists in your AusPost account and environment.');
  } else if (normalized.status && normalized.status >= 500) {
    suggestedActions.push('Retry this operation. If it persists, verify AusPost API availability.');
  }

  if (suggestedActions.length === 0) {
    suggestedActions.push('Retry with corrected inputs or inspect previous workflow step outputs.');
  }

  return {
    message: normalized.message,
    ...(normalized.code ? { code: normalized.code } : {}),
    ...(typeof normalized.status === 'number' ? { status: normalized.status } : {}),
    ...(normalized.details ? { details: normalized.details } : {}),
    ...(typeof normalized.retryAfter === 'number' ? { retry_after_seconds: normalized.retryAfter } : {}),
    suggested_actions: suggestedActions
  };
}

export function makeErrorOutput(
  operation: string,
  error: unknown,
  prerequisiteHint?: string
): { isError: true; output: CommonToolOutput } {
  const mapped = mapSdkError(error, { operation, prerequisiteHint });
  const output: CommonToolOutput = {
    ok: false,
    operation,
    data: {},
    ids: {},
    next_actions: mapped.suggested_actions,
    warnings: [],
    error: mapped
  };

  return {
    isError: true,
    output
  };
}

export function toErrorText(operation: string, mapped: MappedToolError): string {
  const parts = [`${operation} failed: ${mapped.message}`];
  if (mapped.status) parts.push(`status=${mapped.status}`);
  if (mapped.code) parts.push(`code=${mapped.code}`);
  if (mapped.retry_after_seconds !== undefined) {
    parts.push(`retry_after_seconds=${mapped.retry_after_seconds}`);
  }
  if (mapped.suggested_actions.length > 0) {
    parts.push(`suggested_actions=${mapped.suggested_actions.join(' | ')}`);
  }
  return parts.join(' | ');
}
