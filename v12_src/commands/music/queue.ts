import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";
import { format as f, logger as log } from "../../custom/logger";
import MusicManager, { Track } from "../../custom/music-manager";

const queueCommand: Command = {
    name: "queue",
    description: "Queues a music track.",
    aliases: ["q"],
    arguments: [
        {
            key: "track",
            type: "string",
            description:
                "The search phrase for YouTube search or the direct YouTube link",
            default: "",
            infinite: true,
        },
    ],
    enabled: true,
    async run(message: Message, args: ArgumentValues): Promise<null> {
        const mm = MusicManager.getInstance(message.client);
        const trackString = (args.track as string[]).join(" ");

        // Displays queue on no track name passed
        const playlist = ["Currently Queued: "];
        if (trackString === "") {
            log.debug(f("queue", "Displaying queue..."));
            if (mm.queueLength() === 0) {
                message.reply("No tracks left in queue.");
                return null;
            }

            // Fetching all tracks in queue/playlist
            for (const track of mm.playlist) {
                playlist.push(track.title);
            }
            message.reply(playlist);
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

        log.debug(f("queue", "Checking if argument is a YouTube link"));
        let track: Track;
        if (mm.isYTLink(trackString)) {
            log.debug(f("queue", "Argument is a YouTube link"));
            try {
                track = await mm.createTrackFromYTLink(trackString);
                mm.queue(track);
            } catch (error) {
                if (error instanceof Error) {
                    log.error(f("queue", error.message));
                } else {
                    log.error(f("queue", "Unknown error."));
                }
                log.error(
                    f("queue", "Unable to create Track object" + " from youtube link.")
                );
                message.reply(
                    "Unable to queue with the provided link. " +
                        "Only YouTube links are supported. " +
                        "If the link is a youtube link, make sure it is valid."
                );
                return null;
            }
            message.reply(`Queued: ${track.title}`);
            return null;
        } else {
            log.debug(f("queue", "Argument is NOT a link"));
            log.debug(f("queue", `Searching YT for ${trackString}`));
            try {
                track = await mm.search(trackString);
                mm.queue(track);
                log.debug(f("queue", `Queued: ${track.link}`));
                message.reply(`Queued: ${track.title}`);
                return null;
            } catch (error) {
                if (error instanceof Error) {
                    log.error(f("queue", error.message));
                } else {
                    log.error(f("queue", "Unknown error."));
                }
                message.reply([
                    `Couldn't find a link for \`${trackString}\``,
                    "Either the search had no results or the search failed.",
                    "A restart may be necessary...@Bonk",
                ]);
                return null;
            }
        }
    },
};

export default queueCommand;
