import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer as discordCreateAudioPlayer,
  entersState,
  getVoiceConnection as djsGetVoiceConnection,
  joinVoiceChannel as djsJoinVoiceChannel,
  createAudioResource as djsCreateAudioStream,
  AudioResource,
  getVoiceConnection,
} from "@discordjs/voice";
import { inject, singleton } from "tsyringe";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import Stream from "stream";
import { DiscordVoiceInterface } from "./discord-voice.interface";
import { Track } from "../commands/music/track";
import { LoggerProvider } from "./logger.provider";

/**
 * A manager to help maintain and wrap voice related functionality for discord bots.
 *
 * The decision was made to wrap the discord voice calls instead of using them directly for
 * ease of maintaining unit tests and for dependency injection
 */
@singleton() // singleton because we want to keep track of one single queue and audio player
export class DiscordVoiceService implements DiscordVoiceInterface {
  private audioPlayer: AudioPlayer | undefined;
  private queue: Track[] = [];
  constructor(@inject(LoggerProvider) readonly logger: LoggerProvider) {
    this.logger.setName(DiscordVoiceService.name);
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
      if (this.getQueue().length > 0) {
        this.startPlayback(interaction);
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
   * A wrapper around the @discordjs/voice joinVoiceChannel function.
   *
   * It will do extra checks to join the voice channel that the user is currently. If the bot is
   * already in the voice channel then this function will do nothing.
   */
  async joinVoiceChannel(interaction: ChatInputCommandInteraction) {
    const member = await interaction.guild?.members.fetch(interaction.user);
    const channelId = member?.voice.channelId;
    const guildId = interaction.guildId;
    const guild = interaction.guild;
    if (!channelId || !guildId || !guild) {
      this.logger.error("Failed to fetch voice channel parameters:");
      this.logger.error(`channelId: ${channelId}`);
      this.logger.error(`guildId: ${guildId}`);
      this.logger.error(`guild: ${JSON.stringify(guild)}`);
      throw new Error("Failed to join voice channel");
    }

    const voiceChannel = djsGetVoiceConnection(guildId);
    if (voiceChannel?.joinConfig.channelId === channelId) {
      this.logger.debug("Bot is already in the voice channel with the user");
      return;
    }

    this.logger.debug(
      `Joining the voice channel ${member?.voice.channel?.name}`,
    );
    djsJoinVoiceChannel({
      channelId: channelId,
      guildId: guildId,
      adapterCreator: guild.voiceAdapterCreator,
    });
  }

  createAudioStream(input: Stream.Readable | string): AudioResource {
    return djsCreateAudioStream(input);
  }

  /**
   * Starts playback for the bot. If any conditions needed to start playback aren't met,
   * then this bot will return early and do nothing
   *
   * @param interaction the interaction that is associated with the slash command
   * @param track the track to play
   * @returns
   */
  async startPlayback(interaction: ChatInputCommandInteraction) {
    if (!this.audioPlayer) {
      this.logger.error("Unable to play: Audio player is not defined");
      return;
    }
    if (!interaction.guildId) {
      this.logger.error("Unable to play: interaction.guildId is not defined");
      return;
    }

    const track = this.removeFromQueue();
    if (track === undefined) {
      this.logger.error("Unable to play: There is nothing in the queue");
      return;
    }

    // Starts the audio playback on the player and voice connection
    this.audioPlayer?.play(track.audioResource);
    const connection = djsGetVoiceConnection(interaction.guildId);
    connection?.subscribe(this.audioPlayer);

    // Upon entering the playing state, send a message saying what is being played
    await entersState(this.audioPlayer, AudioPlayerStatus.Playing, 5_000);
    const replyEmbed = new EmbedBuilder()
      .setColor("Aqua")
      .setAuthor({ name: "🎶 Playing now! 🎶" })
      .setTitle(`[${track.duration}] ${track.title}`)
      .setURL(track.url)
      .setImage(track.image)
      .addFields({ name: "\u200B", value: track.author });

    if (interaction.channel?.isSendable()) {
      await interaction.channel.send({
        embeds: [replyEmbed],
      });
    }
  }

  destroyVoiceConnection(guildId: string): void {
    const voiceConnection = getVoiceConnection(guildId);
    if (voiceConnection) {
      voiceConnection.destroy();
    }
  }
}
