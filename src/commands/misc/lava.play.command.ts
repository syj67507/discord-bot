import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../base.command";
import { inject, injectable } from "tsyringe";
import { LoggerProvider } from "../../providers/logger.provider";
import { LavalinkProvider } from "../../providers/lavalink.provider";
import { SearchPlatform } from "lavalink-client/dist/types";

@injectable()
export class LavaCommand extends BaseCommand {
  // explicit inject decorator is needed due to the limitation of vitest and tsyringe throwing
  // TypeInfo errors when resolving nested dependencies
  constructor(
    @inject(LoggerProvider) private readonly logger: LoggerProvider,
    @inject(LavalinkProvider) private readonly lavalink: LavalinkProvider,
  ) {
    super();
    this.logger.setName(LavaCommand.name);
  }

  static registrationData = new SlashCommandBuilder()
    .setName("lavaplay")
    .setDescription("Lava test")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("Search input or direct URL")
        .setRequired(true),
    )
    .addStringOption((option) => {
      const choices: { name: string; value: SearchPlatform }[] = [
        { name: "spotify", value: "spotify" },
        { name: "youtube", value: "youtube" },
        { name: "youtube-music", value: "youtubemusic" },
      ];
      return option
        .setName("source")
        .setDescription("The source to find the song from")
        .addChoices(choices);
    });

  async execute(interaction: ChatInputCommandInteraction) {
    // Parsing options
    const input = interaction.options.getString("input");
    const source: SearchPlatform =
      (interaction.options.getString("source") as SearchPlatform) ?? "spotify"; // source defaults back to spotify

    this.logger.log(`Parsed options - input: ${input}`);
    this.logger.log(`Parsed options - source: ${source}`);

    if (!input) {
      return await interaction.reply("You suck at inputs");
    }

    // Check for the voice channel
    const guildId = interaction.guildId;
    const voiceChannelId = (
      await interaction.guild?.members.fetch(interaction.user)
    )?.voice.channelId;

    // notify the user that they must be in a voice channel
    if (!guildId || !voiceChannelId) {
      console.log(guildId, voiceChannelId);
      return await interaction.reply({
        flags: "Ephemeral",
        content: "You must be in a voice channel in order to play music.",
      });
    }

    // get the player
    let player = this.lavalink.getManager().getPlayer(interaction.guildId!);
    if (player === undefined) {
      console.log("creating");
      player = this.lavalink.getManager().createPlayer({
        guildId: guildId,
        voiceChannelId: voiceChannelId,
        textChannelId: interaction.channelId,
        volume: 100,
        selfDeaf: true,
        selfMute: false,
        instaUpdateFiltersFix: true,
        applyVolumeAsFilter: false,
      });
    }

    // search and load the track(s) into the queue
    const response = await player.search(
      {
        query: input,
        // source is used as an override, if the query input is a direct link, then I think the source parameter doesn't matter to the lavalink manager
        source: source,
      },
      interaction.user,
    );
    const isPlaylist = response.loadType === "playlist";
    if (isPlaylist) {
      player.queue.add(response.tracks);
    } else {
      player.queue.add(response.tracks[0]);
    }

    // begin playback if not already playing
    if (player.connected === false) {
      await player.connect();
    }
    if (player.playing === false) {
      await player.play({
        paused: false,
      });
    }

    const track = response.tracks[0];
    const duration = this.lavalink.parseDuration(track.info.duration);

    return await interaction.reply({
      flags: "Ephemeral",
      embeds: [
        {
          color: 0xffffff,
          author: { name: "💿 Added to queue!" },
          title: `${duration} ${track?.info.title}`,
          url: track.info.uri,
          fields: [
            {
              name: track.info.title,
              value: `${track.info.author}
              ${track.pluginInfo.albumName}`,
            },
            {
              name: "\u200B",
              value: `Tracks left in queue: ${player.queue.tracks.length}`,
            },
          ],
          thumbnail: {
            url: track.info.artworkUrl ?? "",
          },
        },
      ],
    });
  }
}
