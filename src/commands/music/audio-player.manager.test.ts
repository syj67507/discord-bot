import "reflect-metadata";
import { container } from "tsyringe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudioPlayerManager } from "./audio-player.manager";
import { LoggerProvider } from "../../providers/logger.provider";
import {
  AudioResource,
  createAudioResource,
  StreamType,
} from "@discordjs/voice";
import { Readable } from "stream";
describe("AudioPlayerManager", () => {
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

      audioPlayerManager.createAudioPlayer();

      expect(audioPlayerManager.getAudioPlayer()).toBeDefined();
    });

    it("should stop an audio player successfully", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);

      audioPlayerManager.createAudioPlayer();
      audioPlayerManager.stopAudioPlayer();

      expect(audioPlayerManager.getAudioPlayer()).toBeDefined();
    });

    it("should destroy an audio player successfully", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);

      audioPlayerManager.createAudioPlayer();
      audioPlayerManager.stopAudioPlayer();
      audioPlayerManager.destroyAudioPlayer();

      expect(audioPlayerManager.getAudioPlayer()).toBeUndefined();
    });

    it("should get an audio player successfully if created", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);

      audioPlayerManager.createAudioPlayer();

      expect(audioPlayerManager.getAudioPlayer()).toBeDefined();
    });

    it("should return undefined if an audio player was not created", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);

      audioPlayerManager.getAudioPlayer();

      expect(audioPlayerManager.getAudioPlayer()).toBeUndefined();
    });
  });

  describe("queue", () => {
    it("should start with an empty queue", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);

      const result = audioPlayerManager.getQueue();

      expect(result).toEqual([]);
    });

    it("should add an audio resource to the queue successfully", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);
      const before = audioPlayerManager.getQueue().length;
      expect(before).toEqual(0);

      const audioResource = createAudioResource(new Readable(), {
        inputType: StreamType.WebmOpus,
      });
      audioPlayerManager.addToQueue(audioResource);
      const result = audioPlayerManager.getQueue().length;

      expect(result).toEqual(1);
    });

    it("should remove an audio resource from the queue successfully", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);
      audioPlayerManager.addToQueue(
        createAudioResource(new Readable(), { inputType: StreamType.WebmOpus }),
      );
      const before = audioPlayerManager.getQueue().length;
      expect(before).toEqual(1);

      const result = audioPlayerManager.removeFromQueue();

      expect(audioPlayerManager.getQueue().length).toEqual(0);
      expect(result).toBeInstanceOf(AudioResource);
    });

    it("should add an audio resource to the top of the queue successfully", () => {
      const audioPlayerManager = container.resolve(AudioPlayerManager);
      const before = audioPlayerManager.getQueue().length;
      expect(before).toEqual(0);

      // add songs to the queue
      const audioResource = createAudioResource(new Readable(), {
        inputType: StreamType.WebmOpus,
      });
      const audioResource2 = createAudioResource(new Readable(), {
        inputType: StreamType.WebmOpus,
      });
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
      const audioResource = createAudioResource(new Readable(), {
        inputType: StreamType.WebmOpus,
      });
      const audioResource2 = createAudioResource(new Readable(), {
        inputType: StreamType.WebmOpus,
      });
      const audioResource3 = createAudioResource(new Readable(), {
        inputType: StreamType.WebmOpus,
      });
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
