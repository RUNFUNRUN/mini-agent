import Anthropic from '@anthropic-ai/sdk';
import { model } from '../../agent.config';

export const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const createAssistantMessage = async (
  messages: Anthropic.MessageParam[],
  allTools: Anthropic.Tool[],
) => {
  return client.messages.create({
    model,
    max_tokens: 8192,
    system: await Bun.file('./SYSTEM_PROMPT').text(),
    messages,
    tools: allTools,
  });
};

export const findToolUse = (message: Anthropic.Message) => {
  return message.content.find((content) => content.type === 'tool_use');
};
