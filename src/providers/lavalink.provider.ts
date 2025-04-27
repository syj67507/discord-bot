import { Client } from "discord.js";
import { LavalinkManager, SearchPlatform } from "lavalink-client";
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
          host: "localhost",
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
      this.logger.error(
        `${JSON.stringify(node)}, ${error}, ${JSON.stringify(payload)}`,
      );
    });

    this.discordClient.on("raw", (d) => this.lavalinkManager.sendRawData(d));
    this.discordClient.on("ready", () => {
      this.lavalinkManager.init({
        id: config.clientId,
      });
    });

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
      const textChannel = discordClient.channels.cache.get(
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
      const timeoutDelay = 10000;
      setTimeout(() => {
        if (player.playing === false && player.queue.tracks.length === 0) {
          this.logger.log(
            `Player is finished, no songs are left in the queue and ${timeoutDelay} has passed.`,
          );
          this.logger.log("Disconnecting player");
          player.disconnect();

          if (player.textChannelId) {
            const channel = discordClient.channels.cache.get(
              player.textChannelId,
            );

            if (channel && channel.isSendable()) {
              // const file = new AttachmentBuilder("./src/assets/oni.png");
              channel.send({
                // files: [file],
                embeds: [
                  {
                    color: 0xffffff,
                    author: { name: `😞 Finished Playback!` },
                    fields: [
                      {
                        name: "\u200B",
                        value: `Tracks left in queue: ${player.queue.tracks.length}`,
                      },
                    ],
                    thumbnail: {
                      url: "https://media.discordapp.net/attachments/749330283081236536/1366085600083574935/oni.png?ex=680fa9db&is=680e585b&hm=79978efee83505e688e05d386f92c8bc7da9ddf04b4f3934d27ccc66191225e8&=&format=webp&quality=lossless&width=1460&height=1460",
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
