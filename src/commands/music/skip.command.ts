import {
  ChatInputCommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import { inject, injectable } from "tsyringe";
import { AudioPlayerManager } from "./audio-player.manager";
import { BaseCommand } from "../base.command";
import { LoggerProvider } from "../../providers/logger.provider";
import {
  AudioPlayerStatus,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";

@injectable()
export class SkipCommand extends BaseCommand {
  constructor(
    @inject(LoggerProvider) private readonly logger: LoggerProvider,
    @inject(AudioPlayerManager)
    private readonly audioPlayerManager: AudioPlayerManager,
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

    if (this.audioPlayerManager.getState() !== AudioPlayerStatus.Playing) {
      await interaction.reply("The bot can't skip if nothing is playing.");
      return;
    }

    const member = await interaction.guild?.members.fetch(interaction.user);
    const channelId = member?.voice.channelId;
    const guildId = interaction.guildId;
    const guild = interaction.guild;
    if (!channelId || !guildId || !guild) {
      this.logger.error("Failed to fetch voice channel parameters:");
      this.logger.error(`channelId: ${channelId}`);
      this.logger.error(`guildId: ${guildId}`);
      this.logger.error(`guild: ${JSON.stringify(guild)}`);
      await interaction.reply("Failed to join voice channel");
      return;
    }
    if (getVoiceConnection(guildId)?.joinConfig.channelId !== channelId) {
      this.logger.warn(
        "Bot is not voice channel with the user, switching to the same voice channel...",
      );
      joinVoiceChannel({
        channelId: channelId,
        guildId: guildId,
        adapterCreator: guild.voiceAdapterCreator,
      });
    }

    const nextResource = this.audioPlayerManager.removeFromQueue();
    if (!nextResource) {
      this.logger.log(
        "Nothing else is left in the queue, stopping the playback.",
      );
      this.audioPlayerManager.stopAudioPlayer();
      this.audioPlayerManager.destroyAudioPlayer();
      await interaction.reply(
        "Reached the end of the queue. Playback has stopped.",
      );
      return;
    }

    // we can assume that there is another resource to skip to
    this.audioPlayerManager.getAudioPlayer()?.play(nextResource);

    await interaction.reply("Skipped");
    this.logger.log("Finished skip command.");
  }
}
