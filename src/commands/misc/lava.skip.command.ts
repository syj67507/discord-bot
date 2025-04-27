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
export class LavaSkipCommand extends BaseCommand {
  constructor(
    @inject(LavalinkProvider) private readonly lavalink: LavalinkProvider,
    @inject(LoggerProvider) private readonly logger: LoggerProvider,
  ) {
    super();
    this.logger.setName(LavaSkipCommand.name);
  }

  static registrationData = new SlashCommandBuilder()
    .setName("lavaskip")
    .setDescription("Skips to the next song in the queue")
    .setContexts(InteractionContextType.Guild);

  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<InteractionResponse> {
    this.logger.debug("Checking for guild Id");
    if (!interaction.guildId) {
      return await interaction.reply({
        flags: "Ephemeral",
        content: "Ran into an error trying to skip to the next song",
      });
    }

    this.logger.debug("Fetching player");
    const player = this.lavalink.getManager().getPlayer(interaction.guildId);
    if (!player || !player.playing) {
      return await interaction.reply({
        flags: "Ephemeral",
        content: "There isn't anything playing",
      });
    }

    if (player.queue.tracks.length === 0) {
      return await interaction.reply({
        flags: "Ephemeral",
        content: "Can't skip if there is nothing left in the queue",
      });
    }

    this.logger.log("Skipping");
    await player.skip();

    return await interaction.reply({
      flags: "Ephemeral",
      content: "Skipped to the next song",
    });
  }
}
