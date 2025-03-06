import type { ToolUseBlock } from '@anthropic-ai/sdk/src/resources/index.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import type { McpServersConfig } from '../types';

export const getMcpClients = async (config: McpServersConfig) => {
  const clients: Client[] = [];

  for (const key in config.mcpServers) {
    const params = config.mcpServers[key];
    const client = new Client({
      name: key,
      version: '0.1.0',
    });

    await client.connect(new StdioClientTransport(params));
    clients.push(client);
  }
  return clients;
};

export const processToolUse = async (
  toolUse: ToolUseBlock,
  toolServerMap: Map<string, Client>,
) => {
  const mcpClient = toolServerMap.get(toolUse.name);
  if (!mcpClient) {
    throw new Error(`Tool server not found for tool ${toolUse.name}`);
  }

  const result = await mcpClient.callTool(
    {
      name: toolUse.name,
      arguments: toolUse.input as { [x: string]: string },
    },
    CallToolResultSchema,
  );

  console.log('Tool Result:', result);
  return CallToolResultSchema.parse(result);
};
