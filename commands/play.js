const { logger: log, format: f } = require("../custom/logger");

module.exports = {
    name: "play",
    description: "The bot joins the voice channel and plays the given song",
    usage: `
        ${process.env.PREFIX}play - Plays the next song in queue if not currently playing.
        ${process.env.PREFIX}play <search> - Plays the song using the search parameter.
        `,
    async execute(message, args) {
        const musicManager = message.client.musicManager;
        try {
            // No song provided, play the next song in queue if not playing
            if (args.length === 0) {
                if (
                    musicManager.isPlaying() === false &&
                    musicManager.queueLength() > 0
                ) {
                    log.debug(f("play", "Joining and starting queue..."));
                    await musicManager.connect(message);
                    musicManager.play(message);
                } else {
                    log.debug(f("play", "Nothing in queue, exiting..."));
                    message.channel.send(
                        "You didn't give me something to play"
                    );
                }
                return;
            }

            // Playing the song that provided
            if (musicManager.isPlaying() === false) {
                log.debug(f("play", "Joining channel..."));
                await musicManager.connect(message);
            }
            log.debug(f("play", "Searching for song..."));
            const song = await musicManager.search(args.join(" "));
            log.debug(f("play", "Queueing..."));
            musicManager.queueAtBeginning(song);
            log.debug(f("play", "Playing..."));
            musicManager.play(message);
        } catch (error) {
            throw error;
        }
    },
};
