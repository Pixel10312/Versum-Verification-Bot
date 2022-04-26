import { ApplicationCommandDataResolvable, Client as BaseClient, ClientEvents, Collection } from 'discord.js';
import glob from 'glob';
import { promisify } from 'util';
import { CommandType } from '../typings/command';
import { CronType } from '../typings/cron';
import { Event } from './event';

const globPromise = promisify(glob);

interface RegisterCommandsOptions {
  guildId?: string;
  commands: ApplicationCommandDataResolvable[];
}

export class Client extends BaseClient {
  commands: Collection<string, CommandType> = new Collection();

  constructor() {
    super({ intents: 32767 });
  }

  start() {
    this.registerModules();
    this.login(process.env.TOKEN);
  }

  async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
    if (guildId) {
      this.guilds.cache.get(guildId)?.commands.set(commands);
    } else {
      this.application?.commands.set(commands);
    }
  }

  async botVersion() {
    const { version } = await this.importFile('../../package.json');
    return version;
  }

  async registerModules() {
    const slashCommands: ApplicationCommandDataResolvable[] = [];

    // load all commands
    const commandFiles = await globPromise(`${__dirname}/../commands/*/*{.ts,.js}`);
    commandFiles.forEach(async (filePath) => {
      const command: CommandType = await this.importFile(filePath);
      if (!command.name) return;

      this.commands.set(command.name, command);
      slashCommands.push(command);
    });

    // load all events
    const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);
    eventFiles.forEach(async (filePath) => {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath);
      this.on(event.event, event.run);
    });

    // load all cron
    const cronjob: CronType[] = [];
    const cronFiles = await globPromise(`${__dirname}/../cron/*{.ts,.js}`);
    cronFiles.forEach(async (filePath) => {
      const cron: CronType = await this.importFile(filePath);
      if (!cron.name) return;
      cronjob.push(cron);
    });

    this.on('ready', () => {
      // register commands
      this.registerCommands({
        commands: slashCommands,
        guildId: process.env.GUILD,
      });

      // run cron tasks
      cronjob.forEach((c) => {
        c.run({ client: this });
      });
    });
  }
}
