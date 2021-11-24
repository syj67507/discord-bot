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

        // Try to get a Track for what the user provides and add it to the queue
        const yt = new YTClient();
        let track: Track | null = null;

        // Try to get the video directly
        if (!track) {
            log.debug(f("queue", `Trying to get a direct video from '${trackString}'`));
            try {
                track = await yt.getVideo(trackString);
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
        if (!track) {
            log.debug(f("queue", `Trying to search YouTube for '${trackString}'`));
            try {
                track = await yt.search(trackString);
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

        // Send error message if no Track could be found
        if (!track) {
            log.debug(f("queue", `Couldn't get a Track for '${trackString}'`));
            message.reply([
                `Couldn't find a link for \`${trackString}\``,
                "Either the search had no results or the search failed.",
                "A restart may be necessary... @Bonk",
            ]);
            return null;
        }

        mm.queue(track);
        log.debug(f("queue", `Queued track: ${JSON.stringify(track)}`));

        // Only display queue message to channel if not called internally by play command
        const prefix = process.env.PREFIX!;
        const ogCommand = message.content
            .slice(prefix.length)
            .split(/[ ]+/)
            .shift()!
            .toLowerCase();
        if (ogCommand === this.name || this.aliases?.includes(ogCommand)) {
            message.reply(`Queued: ${track.title}`);
        }
        return null;
    },
};

export default queueCommand;
