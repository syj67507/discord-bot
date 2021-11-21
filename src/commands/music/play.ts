import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";
import { format as f, logger as log } from "../../custom/logger";
import MusicManager, { Track } from "../../custom/music-manager";
import { YTClient } from "../../custom/ytclient";

const playCommand: Command = {
    name: "play",
    enabled: true,
    description: "Plays a music track.",
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
    async run(message: Message, args: ArgumentValues) {
        const client = message.client;
        const mm = MusicManager.getInstance(client);

        const trackString = (args.track as string[]).join(" ");
        log.debug(f("play", `trackString: '${trackString}'`));

        if (mm.isPlaying() && !trackString) {
            message.reply("I am currently playing... use next to skip to the next song");
            return null;
        }

        const yt = new YTClient();

        // Try to get a Track for what the user provides and add it to the queue
        if (trackString) {
            let track: Track | null = null;

            // Try to get the video directly
            if (!track) {
                log.debug(
                    f("play", `Trying to get a direct video from '${trackString}'`)
                );
                try {
                    track = await yt.getVideo(trackString);
                } catch (error) {
                    log.debug(
                        f(
                            "play",
                            `Unable to retrieve video from direct link: ${
                                (error as Error).message
                            }`
                        )
                    );
                }
            }

            // Try to search for the video
            if (!track) {
                log.debug(f("play", `Trying to search YouTube for '${trackString}'`));
                try {
                    track = await yt.search(trackString);
                } catch (error) {
                    log.debug(
                        f(
                            "play",
                            `Unable to retrieve a video search result: ${
                                (error as Error).message
                            }`
                        )
                    );
                }
            }

            // Send error message if no Track could be found
            if (!track) {
                log.debug(f("play", `Couldn't get a Track for '${trackString}'`));
                message.reply([
                    `Couldn't find a link for \`${trackString}\``,
                    "Either the search had no results or the search failed.",
                    "A restart may be necessary... @Bonk",
                ]);
                return null;
            }

            mm.queue(track);
            log.debug(f("play", `Queued track: ${JSON.stringify(track)}`));
        }

        // Exits if the queue is empty and no track was provided
        if (mm.queueLength() < 1) {
            message.reply("There is nothing to play.");
            return null;
        }

        // Connects and plays
        log.debug(f("play", "Not currently playing. Connecting..."));
        try {
            await mm.connect(message.member!.voice.channel);
            log.debug(f("play", "Connected."));
        } catch (error) {
            log.error(f("play", `${error}`));
            if (trackString) {
                log.error(f("play", "Removing track due to error"));
                mm.playlist.shift();
            }
            message.reply(
                "Unable to join voice channel. " +
                    "Make sure to be a voice channel when using this command."
            );
            return null;
        }
        mm.play(message);
        return null;
    },
};

export default playCommand;
