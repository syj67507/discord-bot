import { inject, injectable } from "tsyringe";
import { BaseCommand } from "../base.command";
import { LoggerProvider } from "../../providers/logger.provider";
import {
  ChatInputCommandInteraction,
  InteractionContextType,
  InteractionResponse,
  SlashCommandBuilder,
} from "discord.js";
import { DiscordVoiceService } from "../../providers/discord-voice.service";

@injectable()
export class StopCommand extends BaseCommand {
  constructor(
    @inject(LoggerProvider) private readonly logger: LoggerProvider,
    @inject(DiscordVoiceService)
    private readonly discordVoiceService: DiscordVoiceService,
  ) {
    super();
  }

  static registrationData = new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stops the bot from playing music")
    .setContexts([InteractionContextType.Guild]);

  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<InteractionResponse> {
    if (!interaction.guildId) {
      return interaction.reply("How did you get here?");
    }

    this.discordVoiceService.destroyVoiceConnection(interaction.guildId);
    this.discordVoiceService.stopAudioPlayer();
    this.discordVoiceService.destroyAudioPlayer();
    this.discordVoiceService.clearQueue();

    return await interaction.reply(
      `${interaction.user} has stopped the music.`,
    );
  }
}
