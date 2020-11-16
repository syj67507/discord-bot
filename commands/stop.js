const { logger: log, format: f } = require("../custom/logger");
const UsageError = require("../custom/UsageError");
const ExecutionError = require("../custom/ExecutionError");

module.exports = {
    name: "stop",
    description: "The bot stops playing music and clears the queue.",
    usage: `
        Available Flags: (clear, -c)
        ${process.env.PREFIX}stop <flag>
        `,
    async execute(message, args) {
        // Check if the bot is in a voice channel
        log.debug(f("stop", "Checking for client's voice connection..."));
        if (message.client.voice.connections.size === 0) {
            log.debug(
                f(
                    "stop",
                    "Client is not playing anything, throwing UsageError..."
                )
            );
            message.channel.send("I am not playing anything!");
            throw new UsageError("Cannot stop when client isn't playing.");
        }
        log.debug(f("stop", "Found voice connection!"));
        // Leaves the channel, throws error on failure.
        try {
            log.debug(f("stop", "Attempting to leave..."));
            message.client.voice.connections.first().channel.leave();
            log.debug(f("stop", "Left the channel"));
        } catch (error) {
            log.error(f("stop", `${error.name}: ${error.message}`));
            throw new ExecutionError("Leaving the voice channel failed.");
        }

        if (args.includes("clear") || args.includes("-c")) {
            log.debug(f("stop", "Clear flag found! Clearing..."));
            message.client.musicQueue = [];
            log.debug(f("stop", "Queue cleared."));
            message.channel.send("The queue has been cleared!");
        }
    },
};
