import { CommandoMessage, Command, CommandoClient } from "discord.js-commando";
import { format as f, logger as log } from "../../custom/logger";
import MusicManager from "../../custom/music-manager";

module.exports = class PlayCommand extends (
    Command
) {
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

        try {
            // Connects if currently not playing
            if (mm.isPlaying() == false) {
                log.debug(f("play", "Not playing. Connecting..."));
                await mm.connect(message.member.voice.channel);
                log.debug(f("play", "Connected."));
            }
            if (args.track) {
                log.debug(f("play", `Searching YT for ${args.track}`));
                const track = await mm.search(args.track);
                mm.queue(track, 0);
                log.debug(f("play", `Queued: ${track.link}`));
            }
            if (mm.queueLength() > 0) {
                mm.play(message);
            }
        } catch (error) {
            log.error(f("play", error));
            message.reply("Join a voice channel in order to play a track.");
        }
        return null;
    }
};
