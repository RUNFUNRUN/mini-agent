import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { ToolSchema } from '@modelcontextprotocol/sdk/types.js';
import type { z } from 'zod';
import { getMcpClients } from '../clients/mcp-client';
import type { McpServersConfig } from '../types';

export const mapToolToAnthropicFormat = (tool: z.infer<typeof ToolSchema>) => {
  return {
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema,
  };
};

export const buildAllTools = async (config: McpServersConfig) => {
  const mcpClients = await getMcpClients(config);
  const toolServerMap = new Map<string, Client>();

  const toolsPromises = mcpClients.map(async (mcpClient) => {
    const toolList = await mcpClient.listTools();
    return toolList.tools.map((tool) => {
      toolServerMap.set(tool.name, mcpClient);
      return mapToolToAnthropicFormat(tool);
    });
  });

  const toolsArrays = await Promise.all(toolsPromises);
  const allTools = toolsArrays.flat();

  return { allTools, toolServerMap };
};
