import type { StdioServerParameters } from '@modelcontextprotocol/sdk/client/stdio.js';

export type McpServersConfig = {
  mcpServers: Record<string, StdioServerParameters>;
};
