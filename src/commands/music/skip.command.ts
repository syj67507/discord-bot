import {
  ChatInputCommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import { inject, injectable } from "tsyringe";
import { BaseCommand } from "../base.command";
import { LoggerProvider } from "../../providers/logger.provider";
import { AudioPlayerStatus } from "@discordjs/voice";
import { DiscordVoiceService } from "../../providers/discord-voice.service";

@injectable()
export class SkipCommand extends BaseCommand {
  constructor(
    @inject(LoggerProvider) private readonly logger: LoggerProvider,
    @inject(DiscordVoiceService)
    private readonly discordVoiceService: DiscordVoiceService,
  ) {
    super();
    this.logger.setName(SkipCommand.name);
  }

  static registrationData = new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips to the next song in the queue")
    .setContexts([InteractionContextType.Guild]);

  async execute(interaction: ChatInputCommandInteraction) {
    this.logger.log("Starting Skip command...");

    if (this.discordVoiceService.getState() !== AudioPlayerStatus.Playing) {
      return await interaction.reply(
        "The bot can't skip if nothing is playing.",
      );
    }

    try {
      await this.discordVoiceService.joinVoiceChannel(interaction);
    } catch (error) {
      this.logger.error((error as Error).message);
      return await interaction.reply("Unable to join the voice channel.");
    }

    const hasNextTrack = this.discordVoiceService.getQueue().length;
    if (!hasNextTrack) {
      this.logger.log(
        "Nothing else is left in the queue, stopping the playback.",
      );
      this.discordVoiceService.stopAudioPlayer();
      this.discordVoiceService.destroyAudioPlayer();
      return await interaction.reply(
        "Reached the end of the queue. Playback has stopped.",
      );
    }

    // we can assume that there is another resource to skip to
    this.discordVoiceService.startPlayback(interaction);

    this.logger.log("Finished skip command.");
    return await interaction.reply("Skipped");
  }
}
