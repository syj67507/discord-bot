import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";
import { format as f, logger as log } from "../../custom/logger";
import MusicManager, { Track } from "../../custom/music-manager";
import { YTClient } from "../../custom/ytclient";
import "dotenv/config";
import playCommand from "./play";

const queueCommand: Command = {
    name: "queue",
    description: "Queues a music track.",
    aliases: ["q"],
    additionalHelpInfo: [
        "**Special Cases:**",
        "`!queue` with no arguments displays a preview of the queue",
        "`!queue clear` clears/empties the queue",
        "`!queue --playlist playlistLink` will queue up a youtube playlist",
    ],
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

        // determine the queue position/offset
        log.debug(f("queue", "Determining the queue position/offset"));
        const positionFlags = ["--position", "--pos"];
        const queuePositionFlagIndex = (args.track as string[]).findIndex((val) =>
            positionFlags.includes(val)
        );
        let queuePosition = mm.queueLength(); // default to the end of the queue

        // Verify provided position paramter
        if (queuePositionFlagIndex > -1) {
            log.debug(
                f(
                    "queue",
                    "Position flag detected. Parsing provided position parameter..."
                )
            );
            const parsedPosition = parseInt(
                (args.track as string[])[queuePositionFlagIndex + 1]
            );

            if (isNaN(parsedPosition) || parsedPosition < 1) {
                log.error(f("queue", "Error in parsing provided position"));
                message.reply([
                    `The provided position: \`${parsedPosition}\` is not valid.`,
                    `If you provide a position flag \`${positionFlags}\`, then you must provide a number greater than 0.`,
                ]);
                return null;
            }

            // parsedPosition from user input will be one off so we must subtract by 1 to make it zero based indexing
            // Remove position flags/parameters
            log.debug(f("queue", `Successfully parsed: ${parsedPosition}`));
            queuePosition = parsedPosition - 1;
            log.debug(
                f(
                    "queue",
                    "Removing the position flag and parameter from the array for normal track string"
                )
            );
            (args.track as string[]).splice(queuePositionFlagIndex, 2);
        }
        log.debug(f("queue", `queue position/offset set at: ${queuePosition}`));

        const trackString = (args.track as string[]).join(" ");

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
        // Different behavior if this was called from play command internally
        const prefix = process.env.PREFIX!;
        const ogCommand = message.content
            .slice(prefix.length)
            .split(/[ ]+/)
            .shift()!
            .toLowerCase();
        const calledFromPlay =
            ogCommand === playCommand.name || playCommand.aliases?.includes(ogCommand);
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
