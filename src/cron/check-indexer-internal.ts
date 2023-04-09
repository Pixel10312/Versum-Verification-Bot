import ms from 'pretty-ms';
import fetch from 'node-fetch';
import { Cron } from '../structures/cron';
import { INDEXER_CHANNEL_ID } from '../discord-ids';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const blocksToMs = (blocks: number) => blocks * 15 * 1000;
const msToBlocks = (seconds: number) => seconds / 30000;

const CHECK_INTERVAL = 1000 * 60 * 15; // checks every 15 minutes
const BLOCKS_BEHIND = msToBlocks(1000 * 60 * 10); // warns if a 10 minute delay is detected
const NAME = 'check-indexer-internal';

export default new Cron({
  name: NAME,
  summary: () => {
    return [
      NAME,
      `Checks every ${ms(
        CHECK_INTERVAL
      )} against status.versum.xyz and if there is a ${BLOCKS_BEHIND} block difference it sends a notification to #indexer`,
    ];
  },
  run: async ({ client }) => {
    const channel = client.channels.cache.get(INDEXER_CHANNEL_ID);

    const checkIndexerStatus = async (delay: number, callback: (levels: number) => any) => {
      try {
        const result = await fetch('https://status.versum.xyz/api/status/mainnet', {
          method: 'GET',
        });

        const { level } = await result.json();

        if (level > BLOCKS_BEHIND) {
          callback(level);
        }
      } catch (error) {
        console.log(NAME, 'error', error);
      }

      await sleep(delay);
      checkIndexerStatus(delay, callback);
    };

    checkIndexerStatus(CHECK_INTERVAL, (blocks: number) => {
      const message = `:warning: Indexer is **${blocks}** blocks behind. Estimated delay around **${ms(
        blocksToMs(blocks)
      )}**.\n@everyone :fire: :scream:`;

      if (channel?.isText()) {
        channel.send(message);
      }
    });
  },
});
