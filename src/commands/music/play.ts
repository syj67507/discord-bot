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
            if (args.track) {
                console.log(mm.playlist);
                log.debug(f("play", `Searching YT for ${args.track}`));
                const track = await mm.search(args.track);
                mm.queue(track, 0);
                log.debug(f("play", `Queued: ${track.link}`));
                console.log(mm.playlist);
            }
            if (mm.queueLength() < 1) {
                return message.reply("There is nothing to play.");
            }
            // Connects if currently not playing
            if (mm.isPlaying() == false) {
                log.debug(f("play", "Not playing. Connecting..."));
                await mm.connect(message.member!.voice.channel);
                log.debug(f("play", "Connected."));
            }
            mm.play(message);
        } catch (error) {
            log.error(f("play", error));
            message.reply(`Error: Contact bot admin ${this.client.owners[0]}.`);
        }
        return null;
    }
};
