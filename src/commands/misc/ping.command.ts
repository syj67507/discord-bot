import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../base.command";
import { inject, injectable } from "tsyringe";
import { LoggerProvider } from "../../providers/logger.provider";
import { SpotifyService } from "../music/services/spotify.service";
import { YouTubeService } from "../music/services/youtube.service";

@injectable()
export class PingCommand extends BaseCommand {
  // explicit inject decorator is needed due to the limitation of vitest and tsyringe throwing
  // TypeInfo errors when resolving nested dependencies
  constructor(
    @inject(LoggerProvider) private readonly logger: LoggerProvider,
    @inject(SpotifyService) private readonly spotifyService: SpotifyService,
    @inject(YouTubeService) private readonly youtubeService: YouTubeService,
  ) {
    super();
    this.logger.setName(PingCommand.name);
  }

  static registrationData = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pings the bot to see if it is responsive")
    .addStringOption((option) =>
      option
        .setName("spotify-link")
        .setDescription("A spotify url")
        .setRequired(true),
    );

  async execute(interaction: ChatInputCommandInteraction) {
    this.logger.log("Starting ping command...");

    const trackUrl = interaction.options.getString("spotify-link");
    if (!trackUrl) {
      return await interaction.reply("YOu suck");
    }

    if (!this.spotifyService.isValidAlbumUrl(trackUrl)) {
      return await interaction.reply(
        `This is not a valid album url: ${trackUrl}`,
      );
    }
    const response = await this.spotifyService.getAlbumTracks(trackUrl);
    // const searchResults = await this.youtubeService.search(
    //   `${response.artist} - ${response.title} | ${response.album}`,
    // );
    this.logger.log(JSON.stringify(response));

    // get options
    const replyOption = interaction.options.getString("reply");

    let message = "Pong!";
    if (replyOption) {
      message += ` ${replyOption}`;
    }

    return await interaction.reply(message);
    this.logger.log("Finished ping command.");
  }
}
