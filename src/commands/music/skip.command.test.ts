import "reflect-metadata";
import { container } from "tsyringe";
import { ChatInputCommandInteraction } from "discord.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SkipCommand } from "./skip.command";
import { AudioPlayerStatus } from "@discordjs/voice";
import yts from "yt-search";
import { DiscordVoiceInterface } from "../../providers/discord-voice.interface";
import { DiscordVoiceService } from "../../providers/discord-voice.service";
import { YouTubeService } from "../../providers/youtube.service";

describe("SkipCommand", () => {
  const interaction = {
    reply: vi.fn(),
    guild: {
      members: {
        fetch: () => {
          return {
            voice: {
              channelId: "mockChannelId",
            },
          };
        },
      },
    },
    guildId: "mockGuildId",
  } as unknown as ChatInputCommandInteraction;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.restoreAllMocks();
    vi.resetModules();

    // registering a mock of the YouTubeClient before each test, must be done this way due to resolving dependency injection
    container.registerInstance(YouTubeService, {
      search: vi.fn().mockImplementation(() => {
        const result: yts.VideoSearchResult = {
          type: "video",
          videoId: "",
          url: "mock url",
          title: "mock title",
          description: "",
          image: "",
          thumbnail: undefined,
          seconds: 0,
          timestamp: "12:34",
          duration: {
            seconds: 0,
            timestamp: "",
          },
          ago: "",
          views: 0,
          author: {
            name: "mock author",
            url: "",
          },
        };
        return [result];
      }),
      getAudioStream: vi.fn(),
    });

    // Mock the discord voice manager, must be done this way due to resolving dependency injection
    container.registerInstance<DiscordVoiceInterface>(DiscordVoiceService, {
      createAudioPlayer: vi.fn(),
      getState: vi.fn(),
      stopAudioPlayer: vi.fn(),
      destroyAudioPlayer: vi.fn(),
      getAudioPlayer: vi.fn(),
      getQueue: vi.fn(),
      addToQueue: vi.fn(),
      removeFromQueue: vi.fn(),
      addToTopOfQueue: vi.fn(),
      clearQueue: vi.fn(),
      joinVoiceChannel: vi.fn(),
      createAudioStream: vi.fn(),
      startPlayback: vi.fn(),
      destroyVoiceConnection: vi.fn(),
    });
  });

  it("should return and reply early if the bot is not playing anything", async () => {
    const skipCommand = container.resolve(SkipCommand);
    const discordVoiceService = container.resolve(DiscordVoiceService);
    const replySpy = vi.spyOn(interaction, "reply");
    vi.spyOn(discordVoiceService, "getState").mockReturnValue(
      AudioPlayerStatus.Idle,
    );

    await skipCommand.execute(interaction);

    expect(replySpy).toHaveBeenCalledTimes(1);
  });

  it("should return and reply early if the bot fails to join the voice channel", async () => {
    const skipCommand = container.resolve(SkipCommand);
    const discordVoiceService = container.resolve(DiscordVoiceService);
    const replySpy = vi.spyOn(interaction, "reply");
    vi.spyOn(discordVoiceService, "getState").mockReturnValue(
      AudioPlayerStatus.Playing,
    );
    vi.spyOn(discordVoiceService, "joinVoiceChannel").mockImplementation(() => {
      throw new Error();
    });

    await skipCommand.execute(interaction);

    expect(replySpy).toHaveBeenCalledTimes(1);
  });

  it("should stop the playback if there is nothing left in the queue", async () => {
    const skipCommand = container.resolve(SkipCommand);
    const discordVoiceService = container.resolve(DiscordVoiceService);
    const replySpy = vi.spyOn(interaction, "reply");
    const stopSpy = vi.spyOn(discordVoiceService, "stopAudioPlayer");
    vi.spyOn(discordVoiceService, "getState").mockReturnValue(
      AudioPlayerStatus.Playing,
    );
    vi.spyOn(discordVoiceService, "getQueue").mockReturnValue([]);

    await skipCommand.execute(interaction);

    expect(replySpy).toHaveBeenCalledTimes(1);
    expect(stopSpy).toHaveBeenCalledTimes(1);
  });

  it("should start the playback if there is a song to skip to", async () => {
    const skipCommand = container.resolve(SkipCommand);
    const discordVoiceService = container.resolve(DiscordVoiceService);
    const replySpy = vi.spyOn(interaction, "reply");
    const playbackSpy = vi.spyOn(discordVoiceService, "startPlayback");
    vi.spyOn(discordVoiceService, "getState").mockReturnValue(
      AudioPlayerStatus.Playing,
    );
    vi.spyOn(discordVoiceService, "getQueue").mockReturnValue([
      {
        title: "",
        duration: "",
        url: "",
        author: "",
        audioResource: discordVoiceService.createAudioStream(""),
        image: "",
      },
    ]);

    await skipCommand.execute(interaction);

    expect(replySpy).toHaveBeenCalledTimes(1);
    expect(playbackSpy).toHaveBeenCalledTimes(1);
  });
});
