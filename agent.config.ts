import type { Model } from '@anthropic-ai/sdk/src/resources/index.js';
import type { McpServersConfig } from './src/types';

export const config: McpServersConfig = {
  mcpServers: {
    shell: {
      command: 'bun',
      args: ['run', process.env.BASH_MCP_SERVER_PATH as string],
    },
  },
};

export const model: Model = 'claude-3-5-sonnet-latest';
