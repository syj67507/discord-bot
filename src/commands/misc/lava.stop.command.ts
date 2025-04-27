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

    await this.lavalink
      .getManager()
      .getPlayer(interaction.guildId)
      ?.stopPlaying();

    return await interaction.reply(
      `${interaction.user} has stopped the music.`,
    );
  }
}
