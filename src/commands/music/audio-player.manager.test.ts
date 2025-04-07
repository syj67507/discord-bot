import "reflect-metadata";
import { container } from "tsyringe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudioPlayerManager } from "./audio-player.manager";
import { LoggerProvider } from "../../providers/logger.provider";
import { createAudioResource, StreamType } from "@discordjs/voice";
import { Readable } from "stream";
import { Track } from "./track";
import { ChatInputCommandInteraction } from "discord.js";

describe("AudioPlayerManager", () => {
  const interaction = {
    options: {
      getString: vi.fn(),
    },
    reply: vi.fn(),
  } as unknown as ChatInputCommandInteraction;

  beforeEach(() => {
    vi.restoreAllMocks();

    // Creating a new instance of the manager so that we have a unique instance for each test
    container.registerInstance(
      AudioPlayerManager,
      new AudioPlayerManager(container.resolve(LoggerProvider)),
    );
  });

  describe("audio player", () => {
    it("should create an audio player successfully", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);

      audioPlayerManager.createAudioPlayer(interaction);

      expect(audioPlayerManager.getAudioPlayer()).toBeDefined();
    });

    it("should stop an audio player successfully", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);

      audioPlayerManager.createAudioPlayer(interaction);
      audioPlayerManager.stopAudioPlayer();

      expect(audioPlayerManager.getAudioPlayer()).toBeDefined();
    });

    it("should destroy an audio player successfully", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);

      audioPlayerManager.createAudioPlayer(interaction);
      audioPlayerManager.stopAudioPlayer();
      audioPlayerManager.destroyAudioPlayer();

      expect(audioPlayerManager.getAudioPlayer()).toBeUndefined();
    });

    it("should get an audio player successfully if created", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);

      audioPlayerManager.createAudioPlayer(interaction);

      expect(audioPlayerManager.getAudioPlayer()).toBeDefined();
    });

    it("should return undefined if an audio player was not created", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);

      audioPlayerManager.getAudioPlayer();

      expect(audioPlayerManager.getAudioPlayer()).toBeUndefined();
    });
  });

  describe("queue", () => {
    function createMockTrack() {
      return new Track({
        title: "test title",
        duration: "duration",
        audioResource: createAudioResource(new Readable(), {
          inputType: StreamType.WebmOpus,
        }),
      });
    }

    it("should start with an empty queue", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);

      const result = audioPlayerManager.getQueue();

      expect(result).toEqual([]);
    });

    it("should add an audio resource to the queue successfully", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);
      const before = audioPlayerManager.getQueue().length;
      expect(before).toEqual(0);

      const audioResource = createMockTrack();
      audioPlayerManager.addToQueue(audioResource);
      const result = audioPlayerManager.getQueue().length;

      expect(result).toEqual(1);
    });

    it("should remove an audio resource from the queue successfully", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);
      audioPlayerManager.addToQueue(createMockTrack());
      const before = audioPlayerManager.getQueue().length;
      expect(before).toEqual(1);

      const result = audioPlayerManager.removeFromQueue();

      expect(audioPlayerManager.getQueue().length).toEqual(0);
      expect(result).toBeInstanceOf(Track);
    });

    it("should add an audio resource to the top of the queue successfully", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);
      const before = audioPlayerManager.getQueue().length;
      expect(before).toEqual(0);

      // add songs to the queue
      const audioResource = createMockTrack();
      const audioResource2 = createMockTrack();
      audioPlayerManager.addToTopOfQueue(audioResource);
      audioPlayerManager.addToQueue(audioResource2);

      // fetch the song that is at the top of the queue
      const result = audioPlayerManager.getQueue()[0];

      // verify that it was added in the correct spot
      expect(audioPlayerManager.getQueue().length).toEqual(2);
      expect(result).toBe(audioResource);
      expect(result).not.toBe(audioResource2);
    });

    it("should add an audio resource to the top of the queue successfully", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);
      const audioResource = createMockTrack();
      const audioResource2 = createMockTrack();
      const audioResource3 = createMockTrack();
      audioPlayerManager.addToQueue(audioResource);
      audioPlayerManager.addToQueue(audioResource2);
      audioPlayerManager.addToQueue(audioResource3);
      const before = audioPlayerManager.getQueue().length;
      expect(before).toEqual(3);

      audioPlayerManager.clearQueue();

      expect(audioPlayerManager.getQueue().length).toEqual(0);
    });
  });
});
