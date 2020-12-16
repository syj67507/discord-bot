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
        const musicManager = message.client.musicManager;

        // Stops only if it is playing
        if (musicManager.isPlaying()) {
            log.debug(f("stop", "Stopping..."));
            musicManager.disconnect();
            log.debug(f("stop", "Disconnected."));
            message.channel.send("I've cut the music.");
        }
    },
};
