import type Anthropic from '@anthropic-ai/sdk';
import {
  createAssistantMessage,
  findToolUse,
} from './clients/anthropic-client';
import { getMcpClients, processToolUse } from './clients/mcp-client';
import { buildAllTools } from './tools/tool-builder';
import type { McpServersConfig } from './types';

export const runAgent = async (
  question: string,
  config: McpServersConfig,
  maxSteps = 30,
) => {
  const { allTools, toolServerMap } = await buildAllTools(config);

  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: await Bun.file('./TOOL_RULES_PROMPT').text(),
    },
    {
      role: 'user',
      content: question,
    },
  ];

  const initialMessage = await createAssistantMessage(messages, allTools);

  if (initialMessage.content[0].type === 'text') {
    const initialText = initialMessage.content[0].text;

    console.log('[ Assistant ]');
    console.log(initialText);

    messages.push({
      role: 'assistant',
      content: initialMessage.content[0].text,
    });
  } else {
    console.log(initialMessage.content);
  }

  const processToolUseLoop = async (
    message: Anthropic.Message,
    iteration = 0,
  ) => {
    const toolUse = findToolUse(message);

    if (!toolUse || iteration >= maxSteps) {
      return;
    }

    console.log({ toolUse });

    const parsedResult = await processToolUse(toolUse, toolServerMap);

    for (const content of parsedResult.content) {
      if (content.type !== 'text') throw new Error('Expected text response');
      messages.push({
        role: 'user',
        content: content.text,
      });
    }

    const nextMessage = await createAssistantMessage(messages, allTools);

    if (nextMessage.content[0].type === 'text') {
      messages.push({
        role: 'assistant',
        content: nextMessage.content[0].text,
      });

      console.log('[ Assistant ]');
      console.log(nextMessage.content[0].text);
    } else if (nextMessage.content[0].type === 'tool_use') {
      messages.push({
        role: 'assistant',
        content: nextMessage.content,
      });
      console.log('Assistant is using a tool...');
    } else {
      throw new Error(
        `Unexpected response type from assistant: ${nextMessage.content[0].type}`,
      );
    }

    return processToolUseLoop(nextMessage, iteration + 1);
  };

  await processToolUseLoop(initialMessage);

  const mcpClients = await getMcpClients(config);
  await Promise.all(
    mcpClients.map(async (client) => {
      await client.close();
    }),
  );
  process.exit(0);
};
