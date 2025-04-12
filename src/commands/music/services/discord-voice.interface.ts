import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
} from "@discordjs/voice";
import { ChatInputCommandInteraction } from "discord.js";
import { Track } from "../track";
import "stream";
import { Readable } from "stream";

/**
 * A manager to help maintain and wrap voice related functionality for discord bots.
 *
 * The decision was made to wrap the discord voice calls instead of using them directly for
 * ease of maintaining unit tests and for dependency injection
 */
export interface DiscordVoiceInterface {
  createAudioPlayer(interaction: ChatInputCommandInteraction): void;
  getState(): AudioPlayerStatus | undefined;
  stopAudioPlayer(): void;

  destroyAudioPlayer(): void;
  getAudioPlayer(): AudioPlayer | undefined;

  /**
   * Returns the queue array object
   *
   * @warning It is not recommended to manipulate this queue directly,
   * instead use the queue methods on this class
   * @returns an AudioResource array
   */
  getQueue(): Track[];

  addToQueue(audioResource: Track): void;

  removeFromQueue(): Track | undefined;

  /**
   * Similar to the addToQueue function but instead adds the resource to the top of the queue,
   * or the beginning
   */
  addToTopOfQueue(audioResource: Track): void;

  /**
   * Empties the queue
   */
  clearQueue(): void;

  /**
   * A wrapper around the @discordjs/voice joinVoiceChannel function.
   *
   * It will do extra checks to join the voice channel that the user is currently. If the bot is
   * already in the voice channel then this function will do nothing.
   */
  joinVoiceChannel(interaction: ChatInputCommandInteraction): Promise<void>;

  createAudioStream(input: Readable | string): AudioResource;

  /**
   * Starts playback for the bot. If any conditions needed to start playback aren't met,
   * then this bot will return early and do nothing
   *
   * @param interaction the interaction that is associated with the slash command
   * @param track the track to play
   * @returns
   */
  startPlayback(
    interaction: ChatInputCommandInteraction,
    track: Track,
  ): Promise<void>;

  /**
   * Destroys the voice connection and cleans up
   * @param guildId The guild id that is associated with the voice connection
   */
  destroyVoiceConnection(guildId: string | undefined): void;
}
