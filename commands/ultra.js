const UsageError = require("../custom/UsageError.js");
const log = require("../custom/logger").logger;
const f = require("../custom/logger").format;

module.exports = {
    name: "ultra",
    description: "Plays the clip...",
    usage: `
        Must be in a voice channel to use the command
        ${process.env.PREFIX}ultra
        `,
    async execute(message, args) {
        // Validation checks
        log.debug(f("ultra", "Validating..."));
        if (message.member.voice.channel == null) {
            message.channel.send("You must join a voice channel.");
            throw new UsageError(
                "Client cannot join a null value voice channel"
            );
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
            log.error(f("ultra", error));
        });

        dispatcher.on("finish", () => {
            log.debug(f("ultra", "Leaving channel..."));
            channel.leave();
            log.debug(f("ultra", "Left the channel"));
        });
    },
};
