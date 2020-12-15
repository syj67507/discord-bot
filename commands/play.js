const { logger: log, format: f } = require("../custom/logger");

module.exports = {
    name: "play",
    description: "The bot joins the voice channel and plays the given song",
    usage: `
        ${process.env.PREFIX}play <search> - Plays the song using the search parameter.
        `,
    async execute(message, args) {
        const musicManager = message.client.musicManager;
        try {
            if (args.length === 0) {
                if (
                    musicManager.isPlaying() === false &&
                    musicManager.queueLength() > 0
                ) {
                    await musicManager.connect(message);
                    musicManager.play(message);
                } else {
                    message.channel.send(
                        "You didn't give me something to play"
                    );
                }
                return;
            }
            if (musicManager.isPlaying() === false) {
                await musicManager.connect(message);
                const song = await musicManager.search(args.join(" "));
                musicManager.queue(song);
                musicManager.play(message);
            } else {
                const song = await musicManager.search(args.join(" "));
                musicManager.queueAtBeginning(song);
                musicManager.play(message);
            }
        } catch (error) {
            throw error;
        }
    },
};
