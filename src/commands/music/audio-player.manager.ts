import {
  AudioPlayer,
  createAudioResource,
  createAudioPlayer as discordCreateAudioPlayer,
} from "@discordjs/voice";
import { inject, singleton } from "tsyringe";
import { LoggerProvider } from "../../providers/logger.provider";
import { Track } from "./track";
import yts from "yt-search";
import ytdl from "@distube/ytdl-core";

/**
 * A manager to help maintain discord audio players since these players need
 * to be shared across different command executions
 */
@singleton()
export class AudioPlayerManager {
  private audioPlayer: AudioPlayer | undefined;
  private queue: Track[] = [];
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
    this.audioPlayer.on("stateChange", (oldState, newState) => {
      this.logger.log("Switched states from", oldState.status, newState.status);
    });
  }

  /**
   * Returns the state of the audio player if one is defined
   */
  getState() {
    return this.audioPlayer?.state.status;
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
  addToQueue(audioResource: Track) {
    this.queue.push(audioResource);
  }

  /**
   * Removes the first item in the queue and returns it
   *
   * If there is nothing in the queue, then this will return undefined
   */
  removeFromQueue(): Track | undefined {
    return this.queue.shift();
  }

  /**
   * Similar to the addToQueue function but instead adds the resource to the top of the queue,
   * or the beginning
   */
  addToTopOfQueue(audioResource: Track) {
    this.queue.unshift(audioResource);
  }

  /**
   * Empties the queue
   */
  clearQueue() {
    this.queue = [];
  }

  /**
   * Creates a new Track object from searching YouTube
   * @param input The search string input
   * @returns A track object that can be played by the audio player
   */
  async createYouTubeTrack(input: string): Promise<Track> {
    const searchResult = await yts(input!);
    const stream = ytdl(searchResult.videos[0].url, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25, // helps with buffering
    });
    return new Track(
      searchResult.videos[0].title,
      searchResult.videos[0].timestamp,
      createAudioResource(stream),
    );
  }
}
