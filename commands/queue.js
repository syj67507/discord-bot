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
            musicManager.clearQueue();
            message.channel.send("Cleared the queue");
            return;
        }

        // Displays queue
        if (args.length < 1) {
            if (musicManager.queueLength() > 0) {
                const displayQueue = [];
                for (const song of musicManager.playlist) {
                    displayQueue.push(song.title);
                }
                message.channel.send(displayQueue);
            } else {
                message.channel.send("No song left in the queue.");
            }
        }

        // Adds search to queue
        else {
            const song = await musicManager.search(args.join(" "));
            musicManager.queue(song);
            message.channel.send(`Added to queue: ${song.title}`);
        }
    },
};
