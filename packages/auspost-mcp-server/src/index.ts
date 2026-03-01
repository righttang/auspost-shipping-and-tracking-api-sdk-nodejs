#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getSdkClient } from './sdk-client.js';
import { createToolHandlers } from './tools/handlers.js';
import { registerAuspostPrompt, registerAuspostTools } from './tools/register-tools.js';
import { WorkflowStateStore } from './workflow-state.js';

export function createServer(): McpServer {
  const server = new McpServer(
    {
      name: 'auspost-mcp-server',
      version: '0.1.0'
    },
    {
      capabilities: {
        tools: {},
        prompts: {}
      }
    }
  );

  const sdk = getSdkClient();
  const workflowState = new WorkflowStateStore();
  const handlers = createToolHandlers(sdk, workflowState);

  registerAuspostPrompt(server);
  registerAuspostTools(server, handlers);

  return server;
}

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('auspost-mcp-server listening on stdio');
}

main().catch((error) => {
  console.error('Failed to start auspost-mcp-server:', error);
  process.exit(1);
});
