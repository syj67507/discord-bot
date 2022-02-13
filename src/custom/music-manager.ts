import { Client, CommandInteraction, VoiceBasedChannel } from "discord.js";
import {
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

export interface Track {
    title: string;
    link: string;
    duration: string | null;
}

export default class MusicManager {
    private static instance: MusicManager;
    static getInstance(client: Client): MusicManager {
        if (!MusicManager.instance) {
            MusicManager.instance = new MusicManager(client);
        }
        return MusicManager.instance;
    }

    private playlist: Track[];
    private client: Client;
    private constructor(client: Client) {
        this.playlist = [];
        this.client = client;
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
     * Connects the bot to the provided voice channel
     *
     * @param {Discord.Message} message Message sent by the user to use a command
     */
    async connect(channel: VoiceBasedChannel): Promise<void> {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        connection.on("stateChange", (oldState, newState) => {
            console.log(
                `voiceConnection State Change: ${oldState.status} -> ${newState.status}`
            );
        });

        // Handle disconnect Lifecycle state
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                // Seems to be reconnecting to a new channel - ignore disconnect
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                connection.destroy();
            }
        });

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
            console.log("Connected and ready!");
        } catch (error) {
            console.error(error);
            console.error("Failed to connect. Destroying and cleaning up...");
            connection.destroy();
        }
    }

    /**
     * Disconnects the bot from the voice channel gracefully and cleans up the connection.
     */
    disconnect(guildId: string): void {
        const connection = getVoiceConnection(guildId);
        if (connection) {
            connection.destroy();
            console.log("Disconnected.");
        }
    }

    /**
     * Plays the next song found within the client's playlist and sends a message to the
     * text channel providing what it is playing. This function is called recursively until there
     * are no more song in the playlist. Once finished, the client will leave the voice channel.
     *
     * Any playback errors that are thrown within the dispatcher will be caught and logged.
     *
     * @param {Discord.Message} message The message that invoked this command.
     */
    play(interaction: CommandInteraction): void {
        console.log("playing...");
        // // Validation checks before playing
        // if (!this.voiceChannel || !this.voiceConnection) {
        //     throw new Error(
        //         "Music Manager not connected. Must be connected in order to play"
        //     );
        // }

        // // Plays the next song in the queue
        // const track = this.playlist.shift();
        // if (!track) {
        //     throw new Error("Queue is empty.");
        // }
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
}
