import { CommandoMessage, Command, CommandoClient } from "discord.js-commando";
import { logger as log, format as f } from "../../custom/logger";

module.exports = class UltraCommand extends (
    Command
) {
    constructor(client: CommandoClient) {
        super(client, {
            name: "ultra",
            group: "misc",
            memberName: "ultra",
            description: "Endeavor...",
        });
    }

    async run(message: CommandoMessage) {
        // Validation checks
        log.debug(f("ultra", "Validating..."));
        if (message.member.voice.channel == null) {
            return message.reply("You must join a voice channel.");
        }
        log.debug(f("ultra", "Validated"));

        // Let the bot join the channel
        log.debug(f("ultra", "Joining channel"));
        const channel = message.member.voice.channel;
        const connection = await channel.join();
        log.debug(f("ultra", "Joined channel"));
        log.debug(f("ultra", `Joined channel: ${channel.name}`));

        // Start yelling on successful join
        const dispatcher = connection.play(
            "media/prominence-burn-1c9da3a6.1280x720r.mp4"
        );

        dispatcher.on("start", () => {
            log.debug(f("ultra", "Playing clip"));
        });

        dispatcher.on("error", (error) => {
            log.error(f("ultra", "Error in playing the clip."));
            log.error(f("ultra", `${error}`));
        });

        dispatcher.on("finish", () => {
            log.debug(f("ultra", "Leaving channel..."));
            channel.leave();
            log.debug(f("ultra", "Left the channel"));
        });
        return null;
    }
};
