import "reflect-metadata";
import { container } from "tsyringe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudioPlayerManager } from "./audio-player.manager";
import { LoggerProvider } from "../../providers/logger.provider";

describe("AudioPlayerManager", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    // Creating a new instance of the manager so that we have a unique instance for each test
    container.registerInstance(
      AudioPlayerManager,
      new AudioPlayerManager(container.resolve(LoggerProvider)),
    );
  });

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
