import { Command } from '../../structures/command';
import { client } from '../../index';

export default new Command({
  name: 'version',
  description: 'returns current bot version',
  run: async ({ interaction }) => {
    const version = await client.botVersion();
    interaction.followUp(`Running version ${version}`);
  },
});
