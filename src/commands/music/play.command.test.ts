import "reflect-metadata";
import { container } from "tsyringe";
import { AutocompleteInteraction } from "discord.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { PlayCommand } from "./play.command";
import { YouTubeClient } from "./youtube.client";
import yts from "yt-search";

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
    vi.spyOn(autocompleteInteraction.options, "getFocused").mockImplementation(
      () => {
        return "mock focused input";
      },
    );

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
    vi.spyOn(autocompleteInteraction.options, "getFocused").mockImplementation(
      () => {
        return "mock focused input";
      },
    );

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

    vi.spyOn(autocompleteInteraction.options, "getFocused").mockImplementation(
      () => {
        return "";
      },
    );

    await playCommand.autocomplete(autocompleteInteraction);

    expect(respondSpy).toHaveBeenCalledWith([]);
  });
});
