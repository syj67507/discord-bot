const UsageError = require("../custom/UsageError.js");
const { logger, format } = require("../logger.js");

module.exports = {
    name: "ultra",
    description: "Plays the clip...",
    usage: `
        Must be in a voice channel to use the command
        ${process.env.PREFIX}ultra
        `,
    async execute(message, args) {
        const ytdl = require("ytdl-core");

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
        logger.debug(format("ultra", "Playing clip"));
        const dispatcher = connection.play(
            ytdl("https://www.youtube.com/watch?v=vaGzR9E9mPU")
        );

        // Use dispatcher to identify the end of the clip
        dispatcher.on("speaking", (speaking) => {
            if (!speaking) {
                logger.debug(format("ultra", "Leaving channel..."));
                channel.leave();
                logger.debug(format("ultra", "Left the channel"));
            }
        });
    },
};
