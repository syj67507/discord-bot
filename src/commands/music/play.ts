import { CommandoMessage, Command, CommandoClient } from "discord.js-commando";
import { format as f, logger as log } from "../../custom/logger";
import MusicManager from "../../custom/music-manager";
import { Track } from "../../custom/music-manager";

module.exports = class PlayCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "play",
            group: "music",
            memberName: "play",
            description: "Plays a music track.",
            argsPromptLimit: 0,
            args: [
                {
                    key: "track",
                    prompt: "What do you want to listen to?",
                    error: "No search phrase given",
                    type: "string",
                    default: "",
                },
            ],
        });
    }

    async run(message: CommandoMessage, args: any) {
        const mm = MusicManager.getInstance(this.client);

        if (mm.isPlaying()) {
            return message.reply(
                "I am currently playing... use next to skip to the next song"
            );
        }

        // Search for a track
        let track: Track;
        if (args.track) {
            log.debug(f("play", `Searching YT for ${args.track}`));
            try {
                track = await mm.search(args.track);
                mm.queue(track, 0);
                log.debug(f("play", `Queued: ${track.link}`));
            } catch (error) {
                log.error(f("play", error));
                return message.reply(
                    `Couldn't find a link for \`${args.track}\``
                );
            }
        }

        // Exits if the queue is empty and no track was provided
        if (mm.queueLength() < 1) {
            return message.reply("There is nothing to play.");
        }

        // Connects and plays
        log.debug(f("play", "Not currently playing. Connecting..."));
        try {
            await mm.connect(message.member!.voice.channel);
            log.debug(f("play", "Connected."));
        } catch (error) {
            log.error(f("play", error));
            if (args.track) {
                log.error(f("play", "Removing track due to error"));
                mm.playlist.shift();
            }
            return message.reply(
                "Unable to join voice channel. " +
                    "Make sure to be a voice channel when using this command."
            );
        }
        mm.play(message);
        return null;
    }
};
