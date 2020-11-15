const { logger: log, format: f } = require("../custom/logger");
const { validateLink } = require("./play");

module.exports = {
    name: "queue",
    description: "The bot adds a track to the queue",
    usage: `
        ${process.env.PREFIX}queue <YouTube Link>
        `,
    async execute(message, args) {
        // Checks if the user wants to clear the queue
        if (args.includes("clear") || args.includes("-c")) {
            message.client.musicQueue = [];
            message.reply(["The queue has been cleared!"]);
            return;
        }

        // Checks if the user wants to display the queue
        if (args.includes("display") || args.includes("-d")) {
            message.reply([
                "Songs in queue: " + message.client.musicQueue.length,
            ]);
            return;
        }

        const songLink = validateLink(message, args);
        addToQueue(message.client.musicQueue, songLink);

        message.reply([
            "Queued up!",
            "Songs in queue: " + message.client.musicQueue.length,
        ]);
    },
};

function addToQueue(musicQueue, songLink) {
    // Check typing of parameters
    if (!Array.isArray(musicQueue) || typeof songLink !== "string") {
        log.debug(f("queue", "addToQueue() has invalid parameters."));
    }

    // Adds to queue
    musicQueue.push(songLink);
}
