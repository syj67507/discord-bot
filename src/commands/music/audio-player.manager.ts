import {
  AudioPlayer,
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
}
