import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../base.command";
import { inject, injectable } from "tsyringe";
import { LoggerProvider } from "../../providers/logger.provider";
import { SpotifyService } from "../../providers/spotify.service";
import { YouTubeService } from "../../providers/youtube.service";

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

    // get options
    const replyOption = interaction.options.getString("reply");

    let message = "Pong!";
    if (replyOption) {
      message += ` ${replyOption}`;
    }

    return await interaction.reply(message);
  }
}
