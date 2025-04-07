import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionContextType,
  InteractionResponse,
  MessageFlags,
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
import { YouTubeClient } from "./youtube.client";
import { Track } from "./track";

@injectable()
export class PlayCommand extends BaseCommand {
  constructor(
    @inject(LoggerProvider) private readonly logger: LoggerProvider,
    @inject(AudioPlayerManager)
    private readonly audioPlayerManager: AudioPlayerManager,
    @inject(YouTubeClient) private readonly youtubeClient: YouTubeClient,
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
        .setRequired(true)
        .setAutocomplete(true),
    )
    .setContexts([InteractionContextType.Guild]);

  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    // gets the user's current input value
    const focusedValue = interaction.options.getFocused();
    if (focusedValue === "") {
      await interaction.respond([]);
      return;
    }

    // finds the results from YouTube and cleans them up to show 10 results
    const searchResults = await this.youtubeClient.search(focusedValue, {
      count: 10,
    });

    const options = searchResults.map((video) => {
      // option names can't be longer than 100 characters so truncating it
      let name = `[${video.timestamp}] ${video.title}`;
      if (name.length > 95) {
        name = `${name.slice(0, 95)}...`;
      }

      return {
        name: name,
        value: video.url,
      };
    });

    // send them back to the user
    await interaction.respond(options);
  }

  async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<InteractionResponse> {
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
      return await interaction.reply("Failed to join voice channel");
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
      this.audioPlayerManager.createAudioPlayer(interaction);
    }
    const audioPlayer = this.audioPlayerManager.getAudioPlayer();
    if (!audioPlayer) {
      this.logger.error("Failed to create the audio player");
      return await interaction.reply("Failed to create the audio player");
    }

    this.logger.debug("Searching YouTube to create a track...");
    const searchResult = await this.youtubeClient.search(input);
    const stream = this.youtubeClient.getAudioStream(searchResult[0].url);
    const track = new Track({
      title: searchResult[0].title,
      url: searchResult[0].url,
      duration: searchResult[0].timestamp,
      author: searchResult[0].author.name,
      audioResource: createAudioResource(stream),
    });

    this.logger.log(
      "Bot is already playing music, adding to the queue and exiting early",
    );
    if (this.audioPlayerManager.getState() === AudioPlayerStatus.Playing) {
      this.audioPlayerManager.addToQueue(track);
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Aqua")
            .setAuthor({ name: "⏭️ Adding to the queue! ⏭️" })
            .setTitle(`[${track.duration}] ${track.title}`)
            .setURL(`${track.url}`)
            .addFields({ name: "\u200B", value: track.author }),
        ],
      });
    }

    this.logger.log("Starting playback of audio resource");
    this.audioPlayerManager.play(interaction, track);
    const connection = getVoiceConnection(guildId);
    connection?.subscribe(audioPlayer);

    this.logger.log("Finished play command.");
    return await interaction.reply({
      content: `${interaction.user} has started playback!`,
    });
  }
}
