import { CommandoMessage, Command, CommandoClient } from "discord.js-commando";
import { format as f, logger as log } from "../../custom/logger";
import MusicManager from "../../custom/music-manager";

module.exports = class StopCommand extends (
    Command
) {
    constructor(client: CommandoClient) {
        super(client, {
            name: "stop",
            group: "music",
            memberName: "stop",
            description:
                "Stops playing music and the bot leaves the voice channel.",
        });
    }

    async run(message: CommandoMessage, args: any) {
        const mm = MusicManager.getInstance(this.client);
        log.debug(f("stop", `MusicManager isPlaying: ${mm.isPlaying()}`));
        mm.disconnect();
        log.debug(f("stop", "MusicManager disconnected."));
        return null;
    }
};
