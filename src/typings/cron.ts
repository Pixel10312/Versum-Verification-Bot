import { Client } from 'discord.js';

interface RunOptions {
  client: Client;
}

type RunFunction = (options: RunOptions) => any;

type SummaryFunction = () => any;

export type CronType = {
  name: string;
  summary?: SummaryFunction;
  run: RunFunction;
};
