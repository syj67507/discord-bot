import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";
import { format as f, logger as log } from "../../custom/logger";
import MusicManager, { Track } from "../../custom/music-manager";
import { YTClient } from "../../custom/ytclient";
import "dotenv/config";

const queueCommand: Command = {
    name: "queue",
    description: "Queues a music track.",
    aliases: ["q"],
    arguments: [
        {
            key: "track",
            type: "string",
            description:
                "The search phrase for YouTube search, direct YouTube video link, or direct YouTube playlist link",
            default: "",
            infinite: true,
        },
    ],
    enabled: true,
    async run(message: Message, args: ArgumentValues): Promise<null> {
        const mm = MusicManager.getInstance(message.client);
        const trackString = (args.track as string[]).join(" ");

        // Different behavior if this was called from play command internally
        const prefix = process.env.PREFIX!;
        const ogCommand = message.content
            .slice(prefix.length)
            .split(/[ ]+/)
            .shift()!
            .toLowerCase();
        const calledFromPlay =
            (ogCommand === this.name || this.aliases?.includes(ogCommand)) === false;
        // queues at beginning if called from play command to play the song right now
        const queuePosition = calledFromPlay ? 0 : mm.queueLength();

        // Displays queue on no track name passed
        if (trackString === "") {
            log.debug(f("queue", "Displaying queue..."));
            if (mm.queueLength() > 0) {
                message.reply([
                    `Currently Queued: ${mm.queueLength()}`,
                    ...mm.getQueuePreview(),
                ]);
            } else {
                message.reply("No tracks left in queue.");
            }
            return null;
        }

        // Clears queue if specified
        if (trackString === "clear") {
            log.debug(f("queue", "Clearing queue..."));
            mm.clearQueue();
            log.debug(f("queue", "Queue cleared."));
            message.reply("Queue has been cleared.");
            return null;
        }

        // Try to get a Track for what the user provides and add it to the queue
        const yt = new YTClient();
        let tracks: Track[] | null = null;

        // If the user wants a playlist, try to get a playlist
        const playlistFlag = "--playlist";
        const playlistFlagPresent = trackString.includes(playlistFlag);
        if (playlistFlagPresent) {
            log.debug(f("queue", `Playlist Flag ${playlistFlag} detected`));
            const playlistLink = trackString.replace(playlistFlag, "").trim();
            log.debug(f("queue", `Trying to get a playlist from '${playlistLink}'`));
            try {
                tracks = await yt.getPlaylist(playlistLink);
            } catch (error) {
                log.debug(
                    f("queue", `Unable to retrieve playlist: ${(error as Error).message}`)
                );
            }
        }

        // Try to get the video directly
        if (!tracks && !playlistFlagPresent) {
            log.debug(f("queue", `Trying to get a direct video from '${trackString}'`));
            try {
                tracks = [await yt.getVideo(trackString)];
            } catch (error) {
                log.debug(
                    f(
                        "queue",
                        `Unable to retrieve video from direct link: ${
                            (error as Error).message
                        }`
                    )
                );
            }
        }

        // Try to search for the video
        if (!tracks && !playlistFlagPresent) {
            log.debug(f("queue", `Trying to search YouTube for '${trackString}'`));
            try {
                tracks = [await yt.search(trackString)];
            } catch (error) {
                log.debug(
                    f(
                        "queue",
                        `Unable to retrieve a video search result: ${
                            (error as Error).message
                        }`
                    )
                );
            }
        }

        // Send error message if no Track(s) could be found
        if (!tracks) {
            log.debug(f("queue", `Couldn't find anything for '${trackString}'`));
            message.reply([
                `Couldn't find anything for \`${trackString}\``,
                "Either the search had no results or the search failed.",
                "A restart may be necessary... @Bonk",
            ]);
            return null;
        }
        for (const i in tracks) {
            mm.queue(tracks[i], queuePosition + parseInt(i));
        }
        log.debug(f("queue", `Queued track(s): ${JSON.stringify(tracks)}`));

        // Only display queue message to channel if not called internally by play command
        if (!calledFromPlay) {
            message.reply([
                `Currently Queued: ${mm.queueLength()}`,
                ...mm.getQueuePreview(),
            ]);
        }
        return null;
    },
};

export default queueCommand;
