const { logger: log, format: f } = require("../custom/logger");

module.exports = {
    name: "next",
    description: "The bot's music player skips to the next song in the queue.",
    usage: `
        ${process.env.PREFIX}next - Skips to the next song in queue
        `,
    async execute(message, args) {
        const musicManager = message.client.musicManager;
        if (!musicManager.isPlaying()) {
            message.channel.send("I'm not playing any music");
            return;
        }
        if (!(musicManager.queueLength() > 0)) {
            message.channel.send("There is nothing left in the queue");
            return;
        }
        musicManager.play(message); // fetches next song and queue and plays
    },
};
