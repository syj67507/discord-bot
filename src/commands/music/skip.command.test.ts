import "reflect-metadata";
import { container } from "tsyringe";
import { ChatInputCommandInteraction } from "discord.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SkipCommand } from "./skip.command";
import { DiscordVoiceService } from "./services/discord-voice.service";
import { AudioPlayerStatus } from "@discordjs/voice";
import { Track } from "./track";
import { DiscordVoiceInterface } from "./services/discord-voice.interface";

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

    // Mock the discord voice manager, must be done this way due to resolving dependency injection
    container.registerInstance<DiscordVoiceInterface>(
      DiscordVoiceService,
      {
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
      },
    );
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

  it("should return and reply early if the bot is not playing anything", async () => {
    const skipCommand = container.resolve(SkipCommand);
    const discordVoiceService = container.resolve(DiscordVoiceService);
    const replySpy = vi.spyOn(interaction, "reply");
    vi.spyOn(discordVoiceService, "getState").mockReturnValue(
      AudioPlayerStatus.Playing,
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

  it("should return and reply early if the bot fails to join the voice channel", async () => {
    const skipCommand = container.resolve(SkipCommand);
    const discordVoiceService = container.resolve(DiscordVoiceService);
    const replySpy = vi.spyOn(interaction, "reply");
    const playbackSpy = vi.spyOn(discordVoiceService, "startPlayback");
    vi.spyOn(discordVoiceService, "getState").mockReturnValue(
      AudioPlayerStatus.Playing,
    );
    vi.spyOn(discordVoiceService, "removeFromQueue").mockReturnValue(
      new Track({
        title: "mock title",
        author: "mock author",
        duration: "12:34",
        audioResource: discordVoiceService.createAudioStream(""),
        url: "mock url",
      }),
    );

    await skipCommand.execute(interaction);

    expect(replySpy).toHaveBeenCalledTimes(1);
    expect(playbackSpy).toHaveBeenCalledTimes(1);
  });
});
