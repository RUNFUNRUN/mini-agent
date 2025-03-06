import { config } from '../agent.config';
import { runAgent } from './agent';

const instruction = await Bun.file('./USER_PROMPT').text();

runAgent(instruction, config);
