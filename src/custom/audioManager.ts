import { Client, Collection, CommandInteraction, VoiceBasedChannel } from "discord.js";
import {
    AudioPlayer,
    AudioPlayerStatus,
    DiscordGatewayAdapterCreator,
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    entersState,
    getVoiceConnection,
    getVoiceConnections,
    joinVoiceChannel,
    AudioResource,
} from "@discordjs/voice";
import ytdl from "ytdl-core";
import { logger as log, format as f } from "./logger";
import path from "path";

export interface Track {
    title: string;
    link: string;
    duration: string | null;
}

export default class AudioManager {
    /**
     * Collection of AudioManager Instances where each key
     * is the guild and the value is associated AudioManager
     * Instance.
     */
    private static instances = new Collection<string, AudioManager>();
    static getInstance(client: Client, guildId: string): AudioManager {
        if (!AudioManager.instances.get(guildId)) {
            AudioManager.instances.set(guildId, new AudioManager(client, guildId));
        }
        return AudioManager.instances.get(guildId)!;
    }

    playlist: Track[];
    private client: Client;
    private guildId: string;
    private audioPlayer: AudioPlayer | null;
    /**
     * If this is set to once, then the playback behavior is to play
     * only one audio resource / track.
     *
     * If this is set to playlist, then the playback behavior is play
     * all tracks in the playlist until there are none left.
     */
    private playbackMode: "once" | "playlist";
    private constructor(client: Client, guildId: string) {
        this.playlist = [];
        this.client = client;
        this.guildId = guildId;
        this.audioPlayer = null;
        this.playbackMode = "playlist"; // default behavior
    }

    /**
     * Returns a copy of the current playlist.
     *
     * @returns {Track[]} A copy of the current playlist
     */
    getPlaylist(): Track[] {
        return [...this.playlist];
    }

    /**
     * Adds a track to the queue/playlist. By default, the track is added
     * at the end. This is configurable using the position parameter.
     *
     * @param {Track} track Track object
     * @param {number} position The position where in playlist to add the track.
     * To add to the beginning, set this parameter to 0.
     */
    queue(track: Track, position: number = this.queueLength()): void {
        this.playlist.splice(position, 0, track);
    }

    /**
     * Takes current playlist and shuffles it.
     * If playlist is empty, then command returns a message saying
     * it cannot shuffle an empty playlist.
     */
    shuffle(): void {
        for (let i = this.playlist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
        }
    }

    /**
     * Returns the number of tracks left in the queue.
     */
    queueLength(): number {
        return this.playlist.length;
    }

    /**
     * Returns an array of strings that represent a preview of what is in
     * the queued playlist.
     */
    getQueuePreview(): string[] {
        let queuedPreview = this.playlist.map(
            (track, index) => `${index + 1}. ${track.title}`
        );
        if (queuedPreview.length > 5) {
            queuedPreview = [
                ...queuedPreview.slice(0, 3),
                "...",
                ...queuedPreview.slice(-1),
            ];
        }
        return queuedPreview;
    }

    /**
     * Resets to the queue to be empty.
     */
    clearQueue(): void {
        this.playlist = [];
    }

    /**
     * Returns true if the manager is currently playing music.
     */
    isPlaying(): boolean {
        // return this.dispatcher !== null;
        return false;
    }

    /**
     * Returns a boolean indicating if there is a voice connection
     * for the provided guild and the client is in a voice channel.
     *
     * @returns Whether a voice connection exists for the provided guild
     */
    isConnected(): boolean {
        return getVoiceConnection(this.guildId) !== undefined;
    }

    /**
     * Helper method to initialize the Audio Player of this instance.
     * Will set proper event listeners and behavior between state changes.
     *
     * If this instance has tracks in queue, transition to the idle state will
     * begin playback of the next track, otherwise the player will stop and call
     * graceful disconnect of the instance.
     *
     * The behavior of when the audio player transitions to the idle state is determined
     * by the playbackMode flag. If set to once, then this instance will gracefully
     * disconnect and stop playback. If set to playback, then this instance will continue
     * to the next track until the playlist is empty or this flag is set to once.
     *
     * Errors detected in playback will cause the player to also stop and call graceful
     * disconnect of the instance.
     */
    initializeAudioPlayer(): void {
        if (this.isConnected() === false) {
            throw new Error("This instance is connected to a voice Channel.");
        }

        if (this.audioPlayer !== null) {
            console.log("ALready initialized, returning...");
            return;
        }
        this.audioPlayer = createAudioPlayer();
        getVoiceConnection(this.guildId)!.subscribe(this.audioPlayer);

        // Log changes between all state changes
        this.audioPlayer.on("stateChange", (oldState, newState) => {
            log.info(
                f(
                    "AUDIOMANAGER",
                    `audioPlayer state: ${oldState.status} -> ${newState.status}`
                )
            );
        });

        // On error, stop this audio player and disconnect
        this.audioPlayer.on("error", (error) => {
            log.error(f("AUDIOMANAGER", `${error}`));
            log.error(
                f(
                    "AUDIOMANAGER",
                    "An error has occured during playback. Stopping playback."
                )
            );
            this.disconnect(`Audio Player Error ${error}`);
        });
        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            // If playbackMode is once, then disconnect
            if (this.playbackMode === "once") {
                console.log("Finished playing direct resource. Now disconnecting...");
                this.disconnect("Played single resource");
                return;
            }

            // playbackMode is playlist
            const track = this.playlist.shift();
            if (track === undefined) {
                console.log("The playlist is empty, there is nothing left to play.");
                console.log("Graceful disconnect");
                this.disconnect(
                    "Playback complete, queue is empty and nothing left to play."
                );
                return;
            } else {
                // Create an audio resource from the next song in queue
                console.log("There is more to play, implement play here.");
                const resource = createAudioResource(
                    ytdl(track.link, {
                        filter: "audioonly",
                        quality: "highestaudio",
                    })
                );
                this.play(resource, "playlist");
            }
        });
        console.log("AudioPLayer initialized", this.audioPlayer !== null);
    }

    /**
     * Connects the bot to the provided voice channel and returns when ready to play
     * audio.
     *
     * This function will subscribe the created voice connection to this class's
     * audio player.
     *
     * @param {Discord.Message} message Message sent by the user to use a command
     */
    async connect(channel: VoiceBasedChannel): Promise<void> {
        // If this instance is connected, then we don't need to set listeners
        const isAlreadyConnected = this.isConnected();

        // Joins the appropriate channel
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        console.log("Current connections:", getVoiceConnections().size);

        // Set event listeners on first time connect
        if (isAlreadyConnected === false) {
            connection.on("stateChange", (oldState, newState) => {
                log.info(
                    f(
                        "AUDIOMANAGER",
                        `voiceConnection state: ${oldState.status} -> ${newState.status}`
                    )
                );
            });

            // Handle disconnect Lifecycle state
            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    // Seems to be reconnecting to a new channel - ignore disconnect
                    // If it doesn't enter either of these states, then the promise rejects
                    // and throws an error.
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                } catch (error) {
                    // Seems to be a real disconnect which SHOULDN'T be recovered from
                    this.disconnect("Manual Disconnect from user");
                }
            });
        }

        // Wait for connection to be ready before returning
        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
            log.info(f("AUDIOMANAGER", "Connected and ready!"));
            // connection.subscribe(this.audioPlayer);
            log.info(
                f(
                    "AUDIOMANAGER",
                    "Connection has been subscribed and hooked up to the audioPlayer!"
                )
            );
        } catch (error) {
            console.error(error);
            console.error(
                "Failed to connect. Disconnecting, destroying, and cleaning up..."
            );
            this.disconnect("AudioManager.connect()");
        }
    }

    /**
     * Disconnects the bot from the voice channel gracefully and destroys the connection.
     * Will also stop the AudioPlayer and set it to null for garbage collection.
     *
     * Note that this is different from @discordjs/voice disconnect function where the
     * connection is still valid for a reconnect. This function intends to disconnect
     * and clean everything else up. Destroy will only be called if the connection
     * currently is not destroyed.
     *
     * @param guildId The id of the guild to disconnect and destroy the connection from
     * @param context The context from where the disconnect happened
     */
    disconnect(context: string): void {
        const connection = getVoiceConnection(this.guildId);
        if (connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
            connection.destroy();
            log.info(f("AUDIOMANAGER", `Destroyed from context: ${context}`));
        }
        if (this.audioPlayer) {
            this.audioPlayer.stop();
            this.audioPlayer = null;
        }
        log.info(f("AUDIOMANAGER", "Disconnect successful."));
    }

    /**
     * Starts playback for this instance. The behavior when a track finishes
     * playing can be configured.
     *
     * If this method is called while this instance is currently playing,
     * then it will interrupt the current track and play the next track if one is
     * available.
     *
     * @param resource The audio resource to play
     * @param playbackMode The behavior of when a track is finished playing. If set
     * to once, then this instance will gracefully disconnect. If set to playback,
     * then this instance will continue to the next track until the playlist is empty
     * or this flag is set to once.
     */
    play(resource: AudioResource, playbackMode: typeof this.playbackMode): void {
        // Only play if connected to a voice channel on the guild
        if (this.isConnected() === false) {
            throw new Error("AudioManagerError: Must be connected in order to play.");
        }

        this.initializeAudioPlayer();

        this.playbackMode = playbackMode;

        // Start playback (transition for audioPlayer from idle -> playing)
        this.audioPlayer!.play(resource);
    }

    /**
     * Convenience method to start playback of the AudioManager in playback mode.
     */
    start(): void {
        const track = this.playlist.shift();
        if (track === undefined) {
            console.log("There is nothing to play");
            return;
        }
        const resource = createAudioResource(
            ytdl(track.link, {
                filter: "audioonly",
                quality: "highestaudio",
            })
        );
        this.play(resource, "playlist");
    }
}
