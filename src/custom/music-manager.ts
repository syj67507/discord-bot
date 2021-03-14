import {
    StreamDispatcher,
    VoiceChannel,
    VoiceConnection,
    VoiceState,
} from "discord.js";
import { CommandoClient, CommandoMessage } from "discord.js-commando";

import ytdl from "ytdl-core";
import ytsr from "ytsr";
import { logger as log, format as f } from "../custom/logger";

export interface Track {
    title: string;
    link: string;
    duration: string | null;
}

export default class MusicManager {
    private static instance: MusicManager;
    static getInstance(client: CommandoClient): MusicManager {
        if (!MusicManager.instance) {
            MusicManager.instance = new MusicManager(client);
        }
        return MusicManager.instance;
    }

    playlist: Track[];
    private client: CommandoClient;
    private voiceChannel: VoiceChannel | null;
    private voiceConnection: VoiceConnection | null;
    private dispatcher: StreamDispatcher | null;
    constructor(client: CommandoClient) {
        this.playlist = [];
        this.client = client;
        this.voiceChannel = null;
        this.voiceConnection = null;
        this.dispatcher = null;

        // Handles manager's property values on voice state changes
        this.client.on(
            "voiceStateUpdate",
            (oldState: VoiceState, newState: VoiceState) => {
                if (newState.member!.user.bot) {
                    if (newState.channel === null) {
                        this.voiceChannel = null;
                        this.voiceConnection = null;
                        this.dispatcher = null;
                    } else {
                        this.voiceChannel = newState.channel;
                        this.voiceConnection = newState.connection; //this.client.voice!.connections.first();
                    }
                    console.log("debug: MUSICMANAGER - Voice Updated:");
                    console.log(
                        "debug: MUSICMANAGER - Voice Channel:",
                        this.voiceChannel?.id
                    );
                    console.log(
                        "debug: MUSICMANAGER - Voice Connection:",
                        this.voiceConnection !== null
                    );
                }
            }
        );
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
     * Returns the number of tracks left in the queue.
     */
    queueLength(): number {
        return this.playlist.length;
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
        return this.dispatcher !== null;
    }
    /**
     * Determines if the passed in argument is a YouTube link
     *
     * @param {string} link The link to the track
     * @returns Boolean
     */
    isYTLink(link: string) {
        // Checks if the link is from YouTube
        const linkTemplates = [
            "https://youtu.be/",
            "https://youtube.com/watch?",
            "https://www.youtu.be/",
            "https://www.youtube.com/watch?",
        ];

        let result = false;
        for (const linkTemplate of linkTemplates) {
            result = result || link.startsWith(linkTemplate);
            if (result) {
                break;
            }
        }
        return result;
    }

    /**
     * Connects the bot to the voice channel that the user is currently in
     *
     * @param {Discord.Message} message Message sent by the user to use a command
     */
    async connect(channel: VoiceChannel | null): Promise<void> {
        // Check if the user is in a voice channel
        if (channel == null) {
            throw new Error(`Unable to join voice channel: ${channel}`);
        }

        // Attempts to connect
        try {
            await channel.join();
        } catch (error) {
            throw error;
        }
    }
    /**
     * Disconnects the bot from the voice channel gracefully.
     */
    disconnect(): void {
        if (this.voiceChannel) {
            this.voiceChannel.leave();
        }
    }

    /**
     * Returns an object that represents the first YouTube search result with the provided
     * search
     *
     * @param {string} searchString Search string used to search on YouTube
     * @throws {Error} Throws a generic error with custom messages based on the status
     * of the search results
     */
    async search(searchString: string): Promise<Track> {
        // Searching
        let searchFilters = null;
        let searchResults = null;

        // Search filters inherently sort by relevance
        // Getting a filter to only return "Videos"
        try {
            searchFilters = await ytsr.getFilters(searchString);
        } catch (error) {
            throw error;
        }
        searchFilters = searchFilters.get("Type");
        if (!searchFilters) {
            throw new Error("Unable to get search filters: Type");
        }
        searchFilters = searchFilters.get("Video");
        if (!searchFilters) {
            throw new Error("Unable to get search filters: Video");
        }

        // Applying filter and getting results
        if (!searchFilters.url) {
            throw new Error("Unable to get search filters URL");
        }
        try {
            searchResults = await ytsr(searchFilters.url, {
                limit: 1,
            });
        } catch (error) {
            throw error;
        }

        // Processing results
        searchResults.items = searchResults.items.filter((item: any) => {
            return item.type === "video";
        });
        if (searchResults.items.length === 0) {
            throw new Error("Search results are empty.");
        }
        return {
            title: (searchResults.items[0] as ytsr.Video).title,
            link: (searchResults.items[0] as ytsr.Video).url,
            duration: (searchResults.items[0] as ytsr.Video).duration,
        };
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
    play(message: CommandoMessage): void {
        // Validation checks before playing
        if (!this.voiceChannel || !this.voiceConnection) {
            throw new Error(
                "Music Manager not connected. Must be connected in order to play"
            );
        }

        // Plays the next song in the queue
        const track = this.playlist.shift();
        if (!track) {
            throw new Error("Queue is empty.");
        }
        const playback = ytdl(track.link, {
            filter: "audioonly",
            quality: "highestaudio",
        });
        this.dispatcher = this.voiceConnection!.play(playback);

        this.dispatcher.on("start", () => {
            log.debug(f("dispatcher", "Now Playing..."));
            message.channel.send(
                `:notes: Now Playing: [${track!.duration}] *${track!.title}*`
            );
        });

        // Plays the next song or leaves if there isn't one
        this.dispatcher.on("finish", () => {
            log.debug(f("dispatcher", "Song has finished."));
            log.debug(
                f("dispatcher", "Songs left in queue: " + this.queueLength())
            );

            if (this.playlist.length > 0) {
                log.debug(f("dispatcher", "Fetching next song in queue..."));
                this.play(message);
            } else {
                log.debug(f("dispatcher", "No more songs left in queue."));
                message.channel.send(
                    "No more songs left in queue. You can add more by using the `queue` command"
                );
                this.disconnect();
                log.debug(f("dispatcher", "Left the voice channel."));
            }
        });

        this.dispatcher.on("error", (error) => {
            message.channel.send("Ran into an error when playing.");
            log.debug(f("dispatcher", `${error}`));
            this.disconnect();
            log.debug(f("play", "Left the voice channel."));
        });
    }
}
