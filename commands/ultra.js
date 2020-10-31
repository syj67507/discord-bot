const UsageError = require("../custom_errors/usage_error.js");
const { logger, format } = require("../logger.js");

module.exports = {
    name: "ultra",
    description: "Plays the clip...",
    usage: `
        Must be in a voice channel to use the command
        ${process.env.PREFIX}ultra
        `,
    async execute(message, args) {
        // Validation checks
        logger.debug(format("ultra", "Validating..."));
        if (message.member.voice.channel == null) {
            message.channel.send("You must join a voice channel.");
            throw new UsageError(
                "Client cannot join a null value voice channel"
            );
        }
        logger.debug(format("ultra", "Validated"));

        // Let the bot join the channel
        logger.debug(format("ultra", "Joining channel"));
        const channel = message.member.voice.channel;
        const connection = await channel.join();
        logger.debug(format("ultra", "Joined channel"));
        logger.debug(format("ultra", `Joined channel: ${channel.name}`));

        // Start yelling on successful join
        const dispatcher = connection.play(
            "media/prominence-burn-1c9da3a6.1280x720r.mp4"
        );

        dispatcher.on("start", () => {
            logger.debug(format("ultra", "Playing clip"));
        });

        dispatcher.on("error", (error) => {
            logger.error(format("ultra", "Error in playing the clip."));
            logger.error(format("ultra", error));
        });

        dispatcher.on("finish", () => {
            logger.debug(format("ultra", "Leaving channel..."));
            channel.leave();
            logger.debug(format("ultra", "Left the channel"));
        });
    },
};
