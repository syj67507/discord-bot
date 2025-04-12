import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  InteractionContextType,
  InteractionResponse,
  SlashCommandBuilder,
} from "discord.js";
import { inject, injectable } from "tsyringe";
import { DiscordVoiceService } from "./services/discord-voice.service";
import { BaseCommand } from "../base.command";
import { LoggerProvider } from "../../providers/logger.provider";
import { YouTubeService } from "./services/youtube.service";
import { Track } from "./track";
import { AudioPlayerStatus } from "@discordjs/voice";

@injectable()
export class PlayCommand extends BaseCommand {
  constructor(
    @inject(LoggerProvider) private readonly logger: LoggerProvider,
    @inject(DiscordVoiceService)
    private readonly discordVoiceService: DiscordVoiceService,
    @inject(YouTubeService) private readonly youtubeService: YouTubeService,
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
    const searchResults = await this.youtubeService.search(focusedValue, {
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

    try {
      await this.discordVoiceService.joinVoiceChannel(interaction);
    } catch (error) {
      this.logger.error((error as Error).message);
      return await interaction.reply("Unable to join the voice channel.");
    }

    if (!this.discordVoiceService.getAudioPlayer()) {
      this.logger.log(
        "Audio player has not been created, creating audio player...",
      );
      this.discordVoiceService.createAudioPlayer(interaction);
    }

    this.logger.debug("Searching YouTube to create a track...");
    const searchResult = await this.youtubeService.search(input);
    const stream = this.youtubeService.getAudioStream(searchResult[0].url);
    const track = new Track({
      title: searchResult[0].title,
      url: searchResult[0].url,
      duration: searchResult[0].timestamp,
      author: searchResult[0].author.name,
      audioResource: this.discordVoiceService.createAudioStream(stream),
    });

    if (this.discordVoiceService.getState() === AudioPlayerStatus.Playing) {
      this.logger.log(
        "Bot is already playing music, adding to the queue and exiting early",
      );
      this.discordVoiceService.addToQueue(track);
      return await interaction.reply({
        embeds: [
          {
            color: 0xffffff,
            title: `[${track.duration}] ${track.title}`,
            author: { name: "⏭️ Adding to the queue! ⏭️" },
            url: track.url,
            fields: [{ name: "\u200B", value: track.author }],
          },
        ],
      });
    }

    this.logger.log("Starting playback of audio resource");
    this.discordVoiceService.startPlayback(interaction, track);

    this.logger.log("Finished play command.");
    return await interaction.reply({
      content: `${interaction.user} has started playback!`,
    });
  }
}
