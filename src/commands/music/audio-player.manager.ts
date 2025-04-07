import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer as discordCreateAudioPlayer,
  entersState,
} from "@discordjs/voice";
import { inject, singleton } from "tsyringe";
import { LoggerProvider } from "../../providers/logger.provider";
import { Track } from "./track";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

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
  createAudioPlayer(interaction: ChatInputCommandInteraction) {
    this.logger.log("Creating audio player");
    this.audioPlayer = discordCreateAudioPlayer();

    // Debugging statement
    this.audioPlayer.on("stateChange", (oldState, newState) => {
      this.logger.debug(
        "Switched states from",
        oldState.status,
        newState.status,
      );
    });

    // This sets up the loop so that when a song finishes, it automatically
    // plays the next song
    this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
      const nextTrack = this.removeFromQueue();
      if (nextTrack) {
        this.play(interaction, nextTrack);
        return;
      }

      this.logger.log("Stopping and destroying audio player...");
      this.stopAudioPlayer();
      this.destroyAudioPlayer();

      if (interaction.channel?.isSendable()) {
        interaction.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Aqua")
              .setAuthor({ name: "⏹️ No more tracks to play." })
              .setTitle("Play more music using the play command!"),
          ],
        });
      }
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

  async play(interaction: ChatInputCommandInteraction, track: Track) {
    if (!this.audioPlayer) {
      return;
    }
    this.audioPlayer?.play(track.audioResource);

    // Upon entering the playing state, send a message saying what is being played
    await entersState(this.audioPlayer, AudioPlayerStatus.Playing, 5_000);
    const replyEmbed = new EmbedBuilder()
      .setColor("Aqua")
      .setAuthor({ name: "🎶 Playing now! 🎶" })
      .setTitle(`[${track.duration}] ${track.title}`)
      .setURL(`${track.url}`)
      .addFields({ name: "\u200B", value: track.author });

    if (interaction.channel?.isSendable()) {
      await interaction.channel.send({
        embeds: [replyEmbed],
      });
    }
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
}
