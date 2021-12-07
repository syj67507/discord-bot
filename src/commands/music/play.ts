import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";
import { format as f, logger as log } from "../../custom/logger";
import MusicManager from "../../custom/music-manager";
import queueCommand from "./queue";

const playCommand: Command = {
    name: "play",
    aliases: ["p"],
    enabled: true,
    description: "Plays a music track.",
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
    async run(message: Message, args: ArgumentValues) {
        const client = message.client;
        const mm = MusicManager.getInstance(client);

        const trackString = (args.track as string[]).join(" ");
        log.debug(f("play", `trackString: '${trackString}'`));

        if (mm.isPlaying() && !trackString) {
            message.reply("I am currently playing... use next to skip to the next song");
            return null;
        }

        // Try to queue up a track to front of queue using the queue command
        if (trackString) {
            // eslint-disable-next-line no-param-reassign
            message.content = message.content + " --position 1";
            (args.track as string[]).push("--position", "1");
            await queueCommand.run(message, args);
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
