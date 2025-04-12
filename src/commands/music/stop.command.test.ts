import "reflect-metadata";
import { container } from "tsyringe";
import { ChatInputCommandInteraction } from "discord.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DiscordVoiceService } from "./services/discord-voice.service";
import { DiscordVoiceInterface } from "./services/discord-voice.interface";
import { StopCommand } from "./stop.command";

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

  it("should return and reply with the bot stopping playback", async () => {
    const stopCommand = container.resolve(StopCommand);
    const replySpy = vi.spyOn(interaction, "reply");

    await stopCommand.execute(interaction);

    expect(replySpy).toHaveBeenCalledOnce();
  });
});
