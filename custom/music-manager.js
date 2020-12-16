const ytdl = require("ytdl-core");
const ytsr = require("ytsr");
const { logger: log, format: f } = require("../custom/logger");

class MusicManager {
    constructor(client) {
        this.playlist = [];
        this.client = client;
        this.voiceChannel = null;
        this.voiceConnection = null;
        this.dispatcher = null;

        this.client.on("voiceStateUpdate", (oldState, newState) => {
            if (newState.member.user.bot) {
                if (newState.channel === null) {
                    this.voiceChannel = null;
                    this.voiceConnection = null;
                    this.dispatcher = null;
                } else {
                    this.voiceChannel = newState.channel;
                    this.voiceConnection = this.client.voice.connections.first();
                }
            }
        });
    }

    queueAtBeginning(song) {
        this.playlist.unshift(song);
    }
    queue(song) {
        this.playlist.push(song);
    }
    queueLength() {
        return this.playlist.length;
    }
    clearQueue() {
        this.playlist = [];
    }

    isPlaying() {
        return this.dispatcher != null;
    }
    /**
     * Determines if the passed in argument is a YouTube link
     *
     * @param {string} link The link to the song
     * @returns Boolean
     */
    isYTLink(link) {
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

    async connect(message) {
        // Check if the user is in a voice channel
        const channel = message.member.voice.channel;
        if (channel == null) {
            message.channel.send("You've got to join a voice channel.");
            throw Error("Unable to join voice channel");
        }

        // Attempts to connect
        try {
            await channel.join();
        } catch (error) {
            throw error;
        }
    }
    disconnect() {
        if (this.voiceChannel) {
            this.voiceChannel.leave();
        }
    }

    async search(searchString) {
        // Searching
        let searchFilters = null;
        let searchResults = null;
        try {
            // Search filters inherently sort by relevance
            // Getting a filter to only return "Videos"
            searchFilters = await ytsr.getFilters(searchString);
            searchFilters = searchFilters
                .get("Type")
                .find((o) => o.name === "Video");

            // Applying filter and getting results
            searchResults = await ytsr(searchString, {
                limit: 1,
                nextpageRef: searchFilters.ref,
            });
        } catch (error) {
            throw error;
        }
        // Processing results
        searchResults.items = searchResults.items.filter((item) => {
            return item.type === "video";
        });
        if (searchResults.items.length === 0) {
            throw new Error("No results found.");
        }

        return {
            title: searchResults.items[0].title,
            link: searchResults.items[0].link,
            duration: searchResults.items[0].duration,
        };
    }
    /**
     * Plays the next song found within the client's playlist and sends a message to the
     * text channel providing what it is playing. This function is called recursively until there
     * are no more song in the playlist. Once finished, the client will leave the voice channel.
     *
     * @param {Discord.Message} message The message that invoked this command.
     */
    play(message) {
        // Plays the next song in the queue
        const song = this.playlist.shift();
        const playback = ytdl(song.link);
        this.dispatcher = this.voiceConnection.play(playback, {
            filter: "audioonly",
            quality: "highestaudio",
        });

        this.dispatcher.on("start", async () => {
            log.debug(f("dispatcher", "Now Playing..."));
            message.channel.send(
                `:notes: Now Playing: [${song.duration}] *${song.title}*`
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
                message.channel.send("No more songs left in queue.");
                this.disconnect();
                log.debug(f("dispatcher", "Left the voice channel."));
            }
        });

        this.dispatcher.on("error", (error) => {
            message.channel.send("Ran into an error when playing.");
            log.debug(f("dispatcher", error));
            this.disconnect();
            log.debug(f("play", "Left the voice channel."));
        });
    }
}

module.exports = MusicManager;
