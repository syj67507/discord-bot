const { logger: log, format: f } = require("../custom/logger");
const { isYTLink, searchForYTLink } = require("./play");

module.exports = {
    name: "queue",
    description: "Manages the queue for playback.",
    usage: `
        ${process.env.PREFIX}queue - Display what is in queue
        ${process.env.PREFIX}queue <search> - Add song to queue using search
        ${process.env.PREFIX}queue clear - Clear the queue
        `,
    async execute(message, args) {
        const musicManager = message.client.musicManager;

        if (args.length === 1 && args[0] === "clear") {
            log.debug(f("queue", "Clearing queue..."));
            musicManager.clearQueue();
            message.channel.send("I've cleared the queue.");
            log.debug(f("queue", "Cleared."));
            return;
        }

        // Displays queue
        if (args.length < 1) {
            log.debug(f("queue", "Displaying queue..."));
            if (musicManager.queueLength() > 0) {
                const displayQueue = [];
                for (const song of musicManager.playlist) {
                    displayQueue.push(song.title);
                }
                message.channel.send(displayQueue);
            } else {
                message.channel.send("No song left in the queue.");
            }
            log.debug(f("queue", "Displayed."));
        }

        // Adds search to queue
        else {
            log.debug(f("queue", "Searching..."));
            const song = await musicManager.search(args.join(" "));
            log.debug(f("queue", "Queueing..."));
            musicManager.queue(song);
            log.debug(f("queue", "Queued."));
            message.channel.send(`Added to queue: ${song.title}`);
        }
    },
};
