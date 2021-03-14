import { CommandoMessage, Command, CommandoClient } from "discord.js-commando";
import { format as f, logger as log } from "../../custom/logger";
import MusicManager from "../../custom/music-manager";

module.exports = class NextCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "next",
            group: "music",
            memberName: "next",
            description: "Plays the next song in the queue.",
        });
    }

    async run(message: CommandoMessage, args: any) {
        const mm = MusicManager.getInstance(this.client);
        log.debug(f("next", `Queue length: ${mm.queueLength()}`));
        if (mm.queueLength() < 1) {
            return message.reply("There are no tracks in the queue.");
        }
        try {
            if (!mm.isPlaying()) {
                log.debug(f("next", "Not playing. Connecting..."));
                await mm.connect(message.member!.voice.channel);
                log.debug(f("next", "Connected."));
            }
            mm.play(message);
        } catch (error) {
            log.error(error);
            message.reply("Unable to skip to next song.");
        }
        return null;
    }
};
