import "reflect-metadata";
import { container } from "tsyringe";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from "discord.js";
import { beforeEach, describe, expect, it, test, vi } from "vitest";
import { PlayCommand } from "./play.command";
import { YouTubeClient } from "./youtube.client";
import yts from "yt-search";
import { DiscordVoiceManager } from "./discord-voice.manager";
import { PassThrough } from "stream";
import {
  AudioPlayerStatus,
  createAudioResource,
  StreamType,
} from "@discordjs/voice";

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

    // registering a mock of the YouTubeClient before each test
    container.registerInstance(YouTubeClient, {
      search: vi.fn(),
      isValidYouTubeUrl: vi.fn(),
      getAudioStream: vi.fn(),
    });
  });

  describe("autocomplete", () => {
    test("the autocomplete function", async () => {
      const playCommand = container.resolve(PlayCommand);
      const youtubeClient = container.resolve(YouTubeClient);
      const respondSpy = vi.spyOn(autocompleteInteraction, "respond");

      vi.spyOn(youtubeClient, "search").mockImplementation(async () => {
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
          name: "[12:34] mock title",
          value: "mock url",
        },
      ]);
    });

    test("the autocomplete function with a really long title", async () => {
      const playCommand = container.resolve(PlayCommand);
      const youtubeClient = container.resolve(YouTubeClient);
      const respondSpy = vi.spyOn(autocompleteInteraction, "respond");

      vi.spyOn(youtubeClient, "search").mockImplementation(async () => {
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

    test("the autocomplete function with no focused input from the user", async () => {
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
      const discordVoiceManager = container.resolve(DiscordVoiceManager);
      vi.spyOn(interaction.options, "getString").mockReturnValue("mock input");
      vi.spyOn(discordVoiceManager, "joinVoiceChannel").mockImplementation(
        () => {
          throw new Error("mock error");
        },
      );

      const replySpy = vi.spyOn(interaction, "reply");

      await playCommand.execute(interaction);

      expect(replySpy).toBeCalledTimes(1);
    });

    it("should start playing music and reply to the user", async () => {
      const playCommand = container.resolve(PlayCommand);
      const discordVoiceManager = container.resolve(DiscordVoiceManager);
      const youtubeClient = container.resolve(YouTubeClient);
      vi.spyOn(interaction.options, "getString").mockReturnValue("mock input");
      vi.spyOn(discordVoiceManager, "joinVoiceChannel").mockImplementation(
        async () => {},
      );
      vi.spyOn(youtubeClient, "search").mockImplementation(async () => {
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
      const stream = new PassThrough();
      vi.spyOn(youtubeClient, "getAudioStream").mockImplementation(() => {
        return stream;
      });
      vi.spyOn(discordVoiceManager, "createAudioStream").mockImplementation(
        () => {
          return createAudioResource(stream, {
            inputType: StreamType.WebmOpus,
          });
        },
      );

      const replySpy = vi.spyOn(interaction, "reply");

      await playCommand.execute(interaction);

      expect(replySpy).toBeCalledTimes(1);
    });

    it("should recognize that music is already playing and add the track to the queue", async () => {
      const playCommand = container.resolve(PlayCommand);
      const discordVoiceManager = container.resolve(DiscordVoiceManager);
      const youtubeClient = container.resolve(YouTubeClient);
      vi.spyOn(interaction.options, "getString").mockReturnValue("mock input");
      vi.spyOn(discordVoiceManager, "joinVoiceChannel").mockImplementation(
        async () => {},
      );
      vi.spyOn(youtubeClient, "search").mockImplementation(async () => {
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
      const stream = new PassThrough();
      vi.spyOn(youtubeClient, "getAudioStream").mockImplementation(() => {
        return stream;
      });
      vi.spyOn(discordVoiceManager, "createAudioStream").mockImplementation(
        () => {
          return createAudioResource(stream, {
            inputType: StreamType.WebmOpus,
          });
        },
      );
      vi.spyOn(discordVoiceManager, "getState").mockReturnValue(
        AudioPlayerStatus.Playing,
      );

      const replySpy = vi.spyOn(interaction, "reply");
      const addToQueueSpy = vi.spyOn(discordVoiceManager, "addToQueue");

      await playCommand.execute(interaction);

      expect(replySpy).toBeCalledTimes(1);
      expect(addToQueueSpy).toBeCalledTimes(1);
    });
  });
});
