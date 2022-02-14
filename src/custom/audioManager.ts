import { Client, CommandInteraction, VoiceBasedChannel } from "discord.js";
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
} from "@discordjs/voice";
// import ytdl from "ytdl-core";
import { logger as log, format as f } from "./logger";
import path from "path";

export interface Track {
    title: string;
    link: string;
    duration: string | null;
}

export default class AudioManager {
    private static instance: AudioManager;
    static getInstance(client: Client): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager(client);
        }
        return AudioManager.instance;
    }

    private playlist: Track[];
    private client: Client;
    private audioPlayer: AudioPlayer;
    private constructor(client: Client) {
        this.playlist = [];
        this.client = client;
        this.audioPlayer = createAudioPlayer();
        this.audioPlayer.on("stateChange", (oldState, newState) => {
            log.info(
                f(
                    "AUDIOMANAGER",
                    `audioPlayer state: ${oldState.status} -> ${newState.status}`
                )
            );
        });
        this.audioPlayer.on("error", (error) => {
            log.error(f("AUDIOMANAGER", `${error}`));
            log.error(
                f(
                    "AUDIOMANAGER",
                    "An error has occured during playback. Stopping playback."
                )
            );
            this.audioPlayer.stop();
        });
        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            console.log("Currently in the idle state ready to play another song.");
        });
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
    isConnected(guildId: string): boolean {
        return getVoiceConnection(guildId) !== undefined;
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
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        console.log("Current connections:", getVoiceConnections().size);
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
                this.disconnect(channel.guildId, "Manual Disconnect from user");
            }
        });

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
            log.info(f("AUDIOMANAGER", "Connected and ready!"));
            connection.subscribe(this.audioPlayer);
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
            this.disconnect(channel.guildId, "AudioManager.connect()");
        }
    }

    /**
     * Disconnects the bot from the voice channel gracefully and destroys the connection.
     *
     * Note that this is different from @discordjs/voice disconnect function where the
     * connection is still valid for a reconnect. This function intends to disconnect
     * and clean everything else up. Destroy will only be called if the connection
     * currently is not destroyed.
     *
     * @param guildId The id of the guild to disconnect and destroy the connection from
     * @param context The context from where the disconnect happened
     */
    disconnect(guildId: string, context: string): void {
        const connection = getVoiceConnection(guildId);
        if (connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
            connection.destroy();
            log.info(f("AUDIOMANAGER", `Destroyed from context: ${context}`));
        }
        log.info(f("AUDIOMANAGER", "Disconnect successful."));
    }

    play(): void {
        const resource = createAudioResource(
            path.join(
                __dirname,
                "..",
                "..",
                "media",
                "prominence-burn-1c9da3a6.1280x720r.mp4"
            )
        );
        this.audioPlayer.play(resource);
    }

    // const playback = ytdl(track.link, {
    //     filter: "audioonly",
    //     quality: "highestaudio",
    // });
    // this.dispatcher = this.voiceConnection!.play(playback);

    // this.dispatcher.on("start", () => {
    //     log.debug(f("dispatcher", "Now Playing..."));
    //     message.channel.send(
    //         `:notes: Now Playing: [${track!.duration}] *${track!.title}*`
    //     );
    // });

    // // Plays the next song or leaves if there isn't one
    // this.dispatcher.on("finish", () => {
    //     log.debug(f("dispatcher", "Song has finished."));
    //     log.debug(f("dispatcher", "Songs left in queue: " + this.queueLength()));

    //     if (this.playlist.length > 0) {
    //         log.debug(f("dispatcher", "Fetching next song in queue..."));
    //         this.play(message);
    //     } else {
    //         log.debug(f("dispatcher", "No more songs left in queue."));
    //         message.channel.send(
    //             "No more songs left in queue. You can add more by using the `queue` command"
    //         );
    //         this.disconnect();
    //         log.debug(f("dispatcher", "Left the voice channel."));
    //     }
    // });

    // this.dispatcher.on("error", (error) => {
    //     message.reply(["There was a playback error.", "A restart is recommended."]);
    //     log.debug(f("dispatcher", `${error}`));
    //     this.disconnect();
    //     log.debug(f("play", "Left the voice channel."));
    // });
}
