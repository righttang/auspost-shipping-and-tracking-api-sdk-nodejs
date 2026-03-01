import AusPostSDK from './vendor-sdk/index.js';
import type { SdkLike } from './types.js';

let cachedSdk: SdkLike | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Set AUSPOST_API_KEY, AUSPOST_API_PASSWORD, and AUSPOST_ACCOUNT_NUMBER before starting the MCP server.`
    );
  }
  return value;
}

export function getSdkClient(): SdkLike {
  if (cachedSdk) {
    return cachedSdk;
  }

  const apiKey = getRequiredEnv('AUSPOST_API_KEY');
  const apiPassword = getRequiredEnv('AUSPOST_API_PASSWORD');
  const accountNumber = getRequiredEnv('AUSPOST_ACCOUNT_NUMBER');
  const baseUrl = process.env.AUSPOST_BASE_URL;
  const timeout = process.env.AUSPOST_TIMEOUT ? Number(process.env.AUSPOST_TIMEOUT) : undefined;

  const sdk = new AusPostSDK({
    apiKey,
    apiPassword,
    accountNumber,
    ...(baseUrl ? { baseUrl } : {}),
    ...(timeout ? { timeout } : {})
  }) as unknown as SdkLike;

  cachedSdk = sdk;
  return sdk;
}

export function resetSdkClientForTests(): void {
  cachedSdk = null;
}
