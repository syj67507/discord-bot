import {
  ChatInputCommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import { inject, injectable } from "tsyringe";
import {
  AudioPlayerStatus,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { AudioPlayerManager } from "./audio-player.manager";
import { BaseCommand } from "../base.command";
import { LoggerProvider } from "../../providers/logger.provider";

@injectable()
export class PlayCommand extends BaseCommand {
  constructor(
    @inject(LoggerProvider) private readonly logger: LoggerProvider,
    @inject(AudioPlayerManager)
    private readonly audioPlayerManager: AudioPlayerManager,
  ) {
    super();
    this.logger.setName(PlayCommand.name);
  }

  static registrationData = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays a song")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription(
          "A url or search input for the video to play from YouTube",
        )
        .setRequired(true),
    )
    .setContexts([InteractionContextType.Guild]);

  async execute(interaction: ChatInputCommandInteraction) {
    this.logger.log("Starting play command...");

    const input = interaction.options.getString("input")!;
    this.logger.log(`Options: input: ${input}`);

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

    if (!this.audioPlayerManager.getAudioPlayer()) {
      this.logger.log(
        "Audio player has not been created, creating audio player...",
      );
      this.audioPlayerManager.createAudioPlayer();
    }
    const audioPlayer = this.audioPlayerManager.getAudioPlayer();
    if (!audioPlayer) {
      this.logger.log("Failed to create the audio player");
      return;
    }

    this.logger.debug("Searching YouTube to create a track...");
    const track = await this.audioPlayerManager.createYouTubeTrack(input);

    this.logger.log(
      "Bot is already playing music, adding to the queue and exiting early",
    );
    if (this.audioPlayerManager.getState() === AudioPlayerStatus.Playing) {
      await interaction.reply("Adding your song to the queue");
      this.audioPlayerManager.addToQueue(track);
      return;
    }

    this.logger.log("Starting playback of audio resource");
    audioPlayer.play(track.audioResource);
    const connection = getVoiceConnection(guildId);
    connection?.subscribe(audioPlayer);

    audioPlayer.on(AudioPlayerStatus.Idle, () => {
      const nextTrack = this.audioPlayerManager.removeFromQueue();
      if (nextTrack) {
        audioPlayer.play(nextTrack.audioResource);
        return;
      }

      this.logger.log("Stopping and destroying audio player...");
      this.audioPlayerManager.stopAudioPlayer();
      this.audioPlayerManager.destroyAudioPlayer();
    });

    await interaction.reply(`Playing ${track.duration} ${track.title}`);
    this.logger.log("Finished play command.");
  }
}
