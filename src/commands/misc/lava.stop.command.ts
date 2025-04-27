import { inject, injectable } from "tsyringe";
import { BaseCommand } from "../base.command";
import { LoggerProvider } from "../../providers/logger.provider";
import {
  ChatInputCommandInteraction,
  InteractionContextType,
  InteractionResponse,
  SlashCommandBuilder,
} from "discord.js";
import { LavalinkProvider } from "../../providers/lavalink.provider";

@injectable()
export class LavaStopCommand extends BaseCommand {
  constructor(
    @inject(LoggerProvider) private readonly logger: LoggerProvider,
    @inject(LavalinkProvider) private readonly lavalink: LavalinkProvider,
  ) {
    super();
    this.logger.setName(LavaStopCommand.name);
  }

  static registrationData = new SlashCommandBuilder()
    .setName("lavastop")
    .setDescription("Stops the bot from playing music")
    .setContexts([InteractionContextType.Guild]);

  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<InteractionResponse> {
    if (!interaction.guildId) {
      return interaction.reply("How did you get here?");
    }

    const player = this.lavalink.getManager().getPlayer(interaction.guildId);

    await player?.stopPlaying();

    return await interaction.reply({
      embeds: [
        {
          color: 0xffffff,
          author: { name: `😞 Finished Playback!` },
          fields: [
            {
              name: "\u200B",
              value: `Tracks left in queue: ${player?.queue.tracks.length}`,
            },
          ],
          thumbnail: {
            url: "https://media.discordapp.net/attachments/749330283081236536/1366085600083574935/oni.png?ex=680fa9db&is=680e585b&hm=79978efee83505e688e05d386f92c8bc7da9ddf04b4f3934d27ccc66191225e8&=&format=webp&quality=lossless&width=1460&height=1460",
          },
        },
      ],
    });
  }
}
