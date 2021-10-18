import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";
import { format as f, logger as log } from "../../custom/logger";
import MusicManager from "../../custom/music-manager";
import { Track } from "../../custom/music-manager";

const playCommand: Command = {
    name: "play",
    enabled: true,
    description: "Plays a music track.",
    arguments: [
        {
            key: "track",
            type: "strings",
            description:
                "The search phrase for YouTube search or the direct YouTube link",
            default: "",
        },
    ],
    async run(message: Message, args: ArgumentValues) {
        const client = message.client;
        const mm = MusicManager.getInstance(client);

        const trackString = args.track as string;

        if (mm.isPlaying() && !trackString) {
            message.reply("I am currently playing... use next to skip to the next song");
            return null;
        }

        // Get a track based on argument
        let track: Track;
        if (trackString) {
            log.debug(f("play", "Checking if argument is a YouTube link"));

            if (mm.isYTLink(trackString)) {
                log.debug(f("play", "Argument is a link"));
                try {
                    track = await mm.createTrackFromYTLink(trackString);
                    mm.queue(track);
                } catch (error) {
                    log.error(f("play", `${error}`));
                    log.error(
                        f("play", "Unable to create Track object" + " from youtube link.")
                    );
                    message.reply(
                        "Unable to play with the provided link. " +
                            "Only YouTube links are supported. " +
                            "If the link is a youtube link, make sure it is valid."
                    );
                    return null;
                }
            } else {
                log.debug(f("play", "Argument is NOT a link"));
                log.debug(f("play", `Searching YT for ${trackString}`));
                try {
                    track = await mm.search(trackString);
                    mm.queue(track, 0);
                    log.debug(f("play", `Queued: ${track.link}`));
                } catch (error) {
                    log.error(f("play", `${error}`));
                    message.reply([
                        `Couldn't find a link for \`${trackString}\``,
                        "Either the search had no results or the search failed.",
                        "A restart may be necessary... @Bonk",
                    ]);
                    return null;
                }
            }
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
