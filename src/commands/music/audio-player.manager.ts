import {
  AudioPlayer,
  AudioResource,
  createAudioPlayer as discordCreateAudioPlayer,
} from "@discordjs/voice";
import { inject, singleton } from "tsyringe";
import { LoggerProvider } from "../../providers/logger.provider";

/**
 * A manager to help maintain discord audio players since these players need
 * to be shared across different command executions
 */
@singleton()
export class AudioPlayerManager {
  private audioPlayer: AudioPlayer | undefined;
  private queue: AudioResource[] = [];
  constructor(@inject(LoggerProvider) private readonly logger: LoggerProvider) {
    this.logger.setName(AudioPlayerManager.name);
  }

  /**
   * Creates a new audio player and will replace the existing audio player if one was previously
   * created and not destroyed
   */
  createAudioPlayer() {
    this.logger.log("Creating audio player");
    this.audioPlayer = discordCreateAudioPlayer();
  }

  /**
   * Stops the audio player if one exists
   */
  stopAudioPlayer() {
    this.logger.log("stopping audio player");
    if (this.audioPlayer) {
      this.audioPlayer.stop();
    }
  }

  /**
   * Destroys the audio player by removing all references to existing
   * audio players
   */
  destroyAudioPlayer() {
    this.logger.log("destroying audio player");
    this.audioPlayer = undefined;
  }

  /**
   * @returns Returns the audio player if it exists
   */
  getAudioPlayer() {
    this.logger.log("fetching audio player");
    return this.audioPlayer;
  }

  /**
   * Returns the queue array object
   *
   * @warning It is not recommended to manipulate this queue directly,
   * instead use the queue methods on this class
   * @returns an AudioResource array
   */
  getQueue() {
    return this.queue;
  }

  /**
   * Adds an audio resource to the end of the queue
   */
  addToQueue(audioResource: AudioResource) {
    this.queue.push(audioResource);
  }

  /**
   * Removes the first item in the queue and returns it
   *
   * If there is nothing in the queue, then this will return undefined
   */
  removeFromQueue(): AudioResource | undefined {
    return this.queue.shift();
  }

  /**
   * Similar to the addToQueue function but instead adds the resource to the top of the queue,
   * or the beginning
   */
  addToTopOfQueue(audioResource: AudioResource) {
    this.queue.unshift(audioResource);
  }

  /**
   * Empties the queue
   */
  clearQueue() {
    this.queue = [];
  }
}
