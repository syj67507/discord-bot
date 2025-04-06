import {
  ChatInputCommandInteraction,
  InteractionContextType,
  SlashCommandBuilder,
} from "discord.js";
import { inject, injectable } from "tsyringe";
import {
  AudioPlayerStatus,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { AudioPlayerManager } from "./audio-player.manager";
import { BaseCommand } from "../base.command";
import { LoggerProvider } from "../../providers/logger.provider";
// import { joinVoiceChannel } from "@discordjs/voice";

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
    .setContexts([InteractionContextType.Guild]);

  async execute(interaction: ChatInputCommandInteraction) {
    this.logger.log("Starting play command...");

    const member = await interaction.guild?.members.fetch(interaction.user);
    const channelId = member?.voice.channelId;
    const guildId = interaction.guildId;
    const guild = interaction.guild;
    this.logger.log(`${channelId}, ${guildId}, ${guild}`);
    if (!channelId || !guildId || !guild) {
      await interaction.reply("Failed to join voice channel");
      return;
    }

    joinVoiceChannel({
      channelId: channelId,
      guildId: guildId,
      adapterCreator: guild?.voiceAdapterCreator,
    });

    this.audioPlayerManager.createAudioPlayer();
    const audioPlayer = this.audioPlayerManager.getAudioPlayer();
    if (!audioPlayer) {
      this.logger.log("Failed to create an audio player successfully");
      return;
    }

    const resource = createAudioResource("./src/Vine.webm");
    audioPlayer.play(resource);

    const connection = getVoiceConnection(guildId);
    connection?.subscribe(audioPlayer);

    audioPlayer.on(AudioPlayerStatus.Idle, () => {
      this.logger.log("Stopping audio player...");
      audioPlayer.stop();
    });

    interaction.reply("Playing...");
    this.logger.log("Finished play command.");
  }
}
