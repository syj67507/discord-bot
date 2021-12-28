import { Message } from "discord.js";
import { Command } from "../../custom/base";
import MusicManager from "../../custom/music-manager";
import { format as f, logger as log } from "../../custom/logger";

const shuffleCommand: Command = {
    name: "shuffle",
    description: "Shuffles the current queued playlist!",
    enabled: true,
    arguments: [],
    async run(message: Message) {
        const client = message.client;
        const mm = MusicManager.getInstance(client);
        if (mm.queueLength() == 0) {
            log.debug(
                f(
                    "shuffle",
                    `Empty playlist cannot shuffle: ${JSON.stringify(mm.playlist)}`
                )
            );
            message.reply("Cannot shuffle an empty playlist!");
            return null;
        }
        log.debug(
            f("shuffle", `Before playlist is shuffled: ${JSON.stringify(mm.playlist)}`)
        );
        mm.shuffle();
        log.debug(f("shuffle", "Displaying shuffled queue..."));
        log.debug(f("shuffle", `Shuffled Queued: ${JSON.stringify(mm.playlist)}`));
        message.reply([
            `Shuffled playlist, now currently queued: ${mm.queueLength()}`,
            ...mm.getQueuePreview(),
        ]);
        return null;
    },
};

export default shuffleCommand;
