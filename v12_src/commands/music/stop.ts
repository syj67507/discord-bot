import { Command } from "../../custom/base";
import { Message } from "discord.js";
import { format as f, logger as log } from "../../custom/logger";
import MusicManager from "../../custom/music-manager";

const stopCommand: Command = {
    name: "stop",
    description: "Stops playing music and the bot leaves the voice channel.",
    arguments: [],
    enabled: true,
    async run(message: Message): Promise<null> {
        const mm = MusicManager.getInstance(message.client);
        log.debug(f("stop", `MusicManager isPlaying: ${mm.isPlaying()}`));
        mm.disconnect();
        log.debug(f("stop", "MusicManager disconnected."));
        return null;
    },
};

export default stopCommand;
