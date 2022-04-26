import { MessageEmbed } from "discord.js"
import { Command } from "../../structures/command"

export default new Command({
  name: "buy",
  description: "Where to buy Materia (MTRIA)",
  run: async ({ interaction }) => {
    // interaction.followUp("display help")

    const embbed = new MessageEmbed()
      .setTitle("Buy Materia `MTRIA`")
      .setDescription(
        "MTRIA's contract address is [KT1KRvNVubq64ttPbQarxec5XdS6ZQU4DVD2](https://tzkt.io/KT1KRvNVubq64ttPbQarxec5XdS6ZQU4DVD2/operations/) and it is available on the following exchanges"
      )
      .addField(
        "Quipuswap",
        "[Buy](https://quipuswap.com/swap/tez-KT1KRvNVubq64ttPbQarxec5XdS6ZQU4DVD2_0)"
      )
      .addField(
        "Spicyswap",
        "[Buy](https://spicyswap.xyz/#/app?tool=swap&tokenLeft=xtz&tokenRight=KT1KRvNVubq64ttPbQarxec5XdS6ZQU4DVD2:0)"
      )
      .setTimestamp()

    interaction.followUp({ embeds: [embbed] })
  },
})
