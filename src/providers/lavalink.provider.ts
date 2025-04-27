import { Client } from "discord.js";
import { LavalinkManager } from "lavalink-client";
import { config } from "../config";
import { inject, singleton } from "tsyringe";
import { LoggerProvider } from "./logger.provider";

@singleton()
export class LavalinkProvider {
  private lavalinkManager: LavalinkManager;
  constructor(
    @inject("Client")
    private readonly discordClient: Client,
    @inject(LoggerProvider)
    private readonly logger: LoggerProvider,
  ) {
    this.logger.setName(LavalinkProvider.name);
    this.lavalinkManager = new LavalinkManager({
      nodes: [
        {
          authorization: config.lavalinkPassword,
          host: config.lavalinkHost,
          port: 2333,
        },
      ],
      sendToShard: (guildId, payload) =>
        this.discordClient.guilds.cache.get(guildId)?.shard?.send(payload),
      autoSkip: true,
      client: {
        id: config.clientId,
      },
    });
    this.lavalinkManager.nodeManager.on("error", (node, error, payload) => {
      this.logger.error(`${node}`);
      this.logger.error(`${error}`);
      this.logger.error(`${payload}`);
    });
    this.connectDiscordHandlers();
    this.setupPlayerHandlers();
  }

  /**
   * Used for initialization
   *
   * Connects the discord client's event handlers to forward information to the lavalink manager
   */
  private connectDiscordHandlers() {
    this.discordClient.on("raw", (d) => this.lavalinkManager.sendRawData(d));
    this.discordClient.on("ready", () => {
      this.lavalinkManager.init({
        id: config.clientId,
      });
    });
  }

  /**
   * Used for initialization
   *
   * Sets up handlers for various states during playback, mainly for sending messages to the text channel
   */
  private setupPlayerHandlers() {
    this.lavalinkManager.on("trackStart", (player, track) => {
      if (!track) {
        this.logger.warn(`Starting track but unable to fetch track info`);
        return;
      }
      if (!player.textChannelId) {
        this.logger.warn(
          `player.textChannelId not found: ${player.textChannelId}`,
        );
        return;
      }
      const textChannel = this.discordClient.channels.cache.get(
        player.textChannelId,
      );
      if (!textChannel) {
        this.logger.warn(
          "Unable to find text channel to send track start message to",
        );
        return;
      }
      if (!textChannel.isSendable()) {
        this.logger.warn("Unable to send message to text channel");
        return;
      }

      const duration = this.parseDuration(track?.info.duration);
      this.logger.log(`Starting track ${duration} ${track.info.title}`);
      textChannel.send({
        embeds: [
          {
            color: 0xffffff,
            title: `${duration} ${track.info.title}`,
            author: { name: "🎶 Starting playback!" },
            url: track?.info.uri,
            fields: [
              {
                name: track.info.title,
                value: `${track.info.author}
                ${track.pluginInfo.albumName}`,
              },
              {
                name: "\u200B",
                value: `Tracks left in queue: ${player.queue.tracks.length.toString()}`,
              },
            ],
            thumbnail: {
              url: track.info.artworkUrl ?? "",
            },
          },
        ],
      });
    });

    this.lavalinkManager.on("queueEnd", (player) => {
      // disconnect and destroy the player for clean up if nothing has been played for at least a minute
      this.logger.debug("Setting timeout to disconnect player");
      const timeoutDelay = config.leaveChannelTimeout;
      setTimeout(() => {
        if (player.playing === false && player.queue.tracks.length === 0) {
          this.logger.log(
            `Player is finished, no songs are left in the queue and ${timeoutDelay} has passed.`,
          );
          this.logger.log("Disconnecting player");
          player.disconnect();

          if (player.textChannelId) {
            const channel = this.discordClient.channels.cache.get(
              player.textChannelId,
            );

            if (channel && channel.isSendable()) {
              // const file = new AttachmentBuilder("./src/assets/oni.png");
              channel.send({
                // files: [file],
                embeds: [
                  {
                    color: 0xffffff,
                    author: {
                      name: `😴 Left the voice channel, idle for more than 10 seconds`,
                    },
                    fields: [
                      {
                        name: "\u200B",
                        value: `Tracks left in queue: ${player.queue.tracks.length}`,
                      },
                    ],
                    thumbnail: {
                      url: "https://media.discordapp.net/attachments/768569245990518816/1366091889367060541/raw.png?ex=680fafb7&is=680e5e37&hm=877b1a3f3de59e1f1f5e346e60733168b90c581d63598c959dadabcfaba31e3a&=&format=webp&quality=lossless&width=1822&height=1822",
                    },
                  },
                ],
              });
            }
          }
        }
      }, timeoutDelay);
    });
  }

  getManager(): LavalinkManager {
    return this.lavalinkManager;
  }

  /**
   * Returns a string in the format of [mm:ss] based on the input
   *
   * @param durationInMS duration in milliseconds
   * @returns a string in the format of [mm:ss]
   */
  parseDuration(durationInMS: number | undefined): string {
    if (durationInMS === undefined) {
      return `[--:--]`;
    }
    const durationInMin = durationInMS / 1000 / 60;
    const minutes = Math.floor(durationInMin).toString().padStart(2, "0");
    const seconds = Math.ceil((durationInMin - Math.floor(durationInMin)) * 60)
      .toString()
      .padStart(2, "0");
    return `[${minutes}:${seconds}]`;
  }
}
