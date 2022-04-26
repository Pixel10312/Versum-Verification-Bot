import { MessageEmbed } from 'discord.js';
import { Event } from '../structures/event';
import { BOT_TEST_CHANNEL_ID } from '../discord-ids';
import { client } from '../index';

export default new Event('ready', (interaction) => {
  const channel = interaction.channels.cache.get(BOT_TEST_CHANNEL_ID);

  const greeting = async () => {
    if (channel?.isText()) {
      const version = await client.botVersion();

      const embbed = new MessageEmbed()
        .setTitle('Hello World')
        .setDescription(
          `Hi :wave:, I just got upgraded! I'm currently running version ${version} :tada:\n\nCheck [what's new](https://github.com/versumstudios/discord-bot/blob/main/CHANGELOG.md) on Github`
        )

        .setTimestamp();

      if (process.env.NODE_ENV === 'production') {
        channel.send({ embeds: [embbed] });
      }

      console.log(`Versum Bot [${version}] NODE_ENV=${process.env.NODE_ENV}`);
    }
  };

  greeting();
});
