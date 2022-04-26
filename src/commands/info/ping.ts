import { Command } from '../../structures/command';

export default new Command({
  name: 'ping',
  description: 'replies with pong',
  run: async ({ interaction }) => {
    interaction.followUp('pong');
  },
});
