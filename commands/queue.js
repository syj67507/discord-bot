const { logger: log, format: f } = require("../custom/logger");
const { validateLink } = require("./play");

module.exports = {
    name: "queue",
    description: "The bot adds a track to the queue",
    usage: `
        Available Flags: (display, -d) | (clear, -c)
        ${process.env.PREFIX}queue <YouTube Link>
        ${process.env.PREFIX}queue <flag>
        `,
    async execute(message, args) {
        log.debug(f("queue", "Checking for flags..."));

        // Checks if the user wants to clear the queue
        if (args.includes("clear") || args.includes("-c")) {
            log.debug(f("queue", "Found the clear flag."));
            message.client.musicQueue = [];
            message.reply(["The queue has been cleared!"]);
            log.debug(f("queue", "Cleared the queue."));
            log.debug(
                f(
                    "queue",
                    "Songs in queue: " + message.client.musicQueue.length
                )
            );
            return;
        }

        // Checks if the user wants to display the queue
        if (args.includes("display") || args.includes("-d")) {
            log.debug(f("queue", "Found the display flag."));
            message.reply([
                "Songs in queue: " + message.client.musicQueue.length,
            ]);
            log.debug(f("queue", "Displayed queue length."));
            return;
        }

        log.debug(f("queue", "Validating song link..."));
        const songLink = validateLink(message, args);
        log.debug(f("queue", "Adding to queue..."));
        addToQueue(message.client.musicQueue, songLink);
        log.debug(f("queue", "Queue successful."));

        message.reply([
            "Queued up!",
            "Songs in queue: " + message.client.musicQueue.length,
        ]);
    },
    addToQueue,
};

function addToQueue(musicQueue, songLink) {
    // Check typing of parameters
    if (!Array.isArray(musicQueue) || typeof songLink !== "string") {
        log.debug(f("queue", "addToQueue() has invalid parameters."));
        throw new TypeError("addToQueue has invalid parameters");
    }

    // Adds to queue
    musicQueue.push(songLink);
}
