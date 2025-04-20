import "reflect-metadata";
import { container } from "tsyringe";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from "discord.js";
import { beforeEach, describe, expect, it, test, vi } from "vitest";
import { PlayCommand } from "./play.command";
import yts from "yt-search";
import { AudioPlayerStatus } from "@discordjs/voice";
import { DiscordVoiceInterface } from "../../providers/discord-voice.interface";
import { DiscordVoiceService } from "../../providers/discord-voice.service";
import { YouTubeService } from "../../providers/youtube.service";

describe("PlayCommand", () => {
  const autocompleteInteraction = {
    respond: vi.fn(),
    options: {
      getFocused: vi.fn(),
    },
  } as unknown as AutocompleteInteraction;

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

  describe("autocomplete", () => {
    test("the autocomplete function should respond with an option", async () => {
      const playCommand = container.resolve(PlayCommand);
      const respondSpy = vi.spyOn(autocompleteInteraction, "respond");

      vi.spyOn(
        autocompleteInteraction.options,
        "getFocused",
      ).mockImplementation(() => {
        return "mock focused input";
      });

      await playCommand.autocomplete(autocompleteInteraction);

      expect(respondSpy).toHaveBeenCalledWith([
        {
          name: "[12:34] mock title",
          value: "mock url",
        },
      ]);
    });

    test("the autocomplete function should parse a really long title and respond with an option", async () => {
      const playCommand = container.resolve(PlayCommand);
      const youtubeService = container.resolve(YouTubeService);
      const respondSpy = vi.spyOn(autocompleteInteraction, "respond");

      // overwriting mock to return a video with a really long title
      vi.spyOn(youtubeService, "search").mockImplementation(async () => {
        const result: yts.VideoSearchResult = {
          type: "video",
          videoId: "",
          url: "mock url",
          title: "mock title".repeat(10),
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
      });

      vi.spyOn(
        autocompleteInteraction.options,
        "getFocused",
      ).mockImplementation(() => {
        return "mock focused input";
      });

      await playCommand.autocomplete(autocompleteInteraction);

      expect(respondSpy).toHaveBeenCalledWith([
        {
          name: "[12:34] mock titlemock titlemock titlemock titlemock titlemock titlemock titlemock titlemock ti...",
          value: "mock url",
        },
      ]);
    });

    test("the autocomplete function should return no options with an empty user input", async () => {
      const playCommand = container.resolve(PlayCommand);
      const respondSpy = vi.spyOn(autocompleteInteraction, "respond");

      vi.spyOn(
        autocompleteInteraction.options,
        "getFocused",
      ).mockImplementation(() => {
        return "";
      });

      await playCommand.autocomplete(autocompleteInteraction);

      expect(respondSpy).toHaveBeenCalledWith([]);
    });
  });

  describe("execute", () => {
    const interaction = {
      options: {
        getString: vi.fn(),
      },
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

    it("should reply to the user if the bot is unable to join the voice channel", async () => {
      const playCommand = container.resolve(PlayCommand);
      const discordVoiceService = container.resolve(DiscordVoiceService);
      const replySpy = vi.spyOn(interaction, "reply");
      vi.spyOn(interaction.options, "getString").mockReturnValue("mock input");
      vi.spyOn(discordVoiceService, "joinVoiceChannel").mockImplementation(
        () => {
          throw new Error("mock error");
        },
      );

      await playCommand.execute(interaction);

      expect(replySpy).toBeCalledTimes(1);
    });

    it("should start playing music and reply to the user", async () => {
      const playCommand = container.resolve(PlayCommand);
      const replySpy = vi.spyOn(interaction, "reply");
      vi.spyOn(interaction.options, "getString").mockReturnValue("mock input");

      await playCommand.execute(interaction);

      expect(replySpy).toBeCalledTimes(1);
    });

    it("should recognize that music is already playing and add the track to the queue", async () => {
      const playCommand = container.resolve(PlayCommand);
      const discordVoiceService = container.resolve(DiscordVoiceService);
      vi.spyOn(interaction.options, "getString").mockReturnValue("mock input");
      vi.spyOn(discordVoiceService, "getState").mockReturnValue(
        AudioPlayerStatus.Playing,
      );

      const replySpy = vi.spyOn(interaction, "reply");
      const addToQueueSpy = vi.spyOn(discordVoiceService, "addToQueue");

      await playCommand.execute(interaction);

      expect(replySpy).toBeCalledTimes(1);
      expect(addToQueueSpy).toBeCalledTimes(1);
    });
  });
});
