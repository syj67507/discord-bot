const { logger: log, format: f } = require("../custom/logger");
const UsageError = require("../custom/UsageError");
const ytdl = require("ytdl-core");

module.exports = {
    name: "play",
    description: "The bot joins the voice channel and plays the given song",
    usage: `
        ${process.env.PREFIX}play <YouTube link>
        `,
    async execute(message, args) {
        log.debug(f("play", "Validating..."));
        const channel = validateChannel(message);
        const songLink = validateLink(message, args);
        // const songInfo = await ytdl.getBasicInfo(songLink);

        // Plays the song
        log.debug(f("play", "Joining voice channel..."));
        const connection = await channel.join();

        log.debug(f("play", "Retrieving song..."));
        const song = ytdl(songLink);
        playSong(song, connection, message, channel);
    },
};

function validateChannel(message) {
    // Check if the user is in a voice channel
    const channel = message.member.voice.channel;
    if (channel == null) {
        message.channel.send("You've got to join a voice channel.");
        throw new UsageError("User not in voice channel");
    }
    return channel;
}

function validateLink(message, args) {
    // Must provide one link
    if (args.length != 1) {
        message.channel.send("You must provide one link.");
        throw new UsageError("No link provided");
    }

    // Checks if the link is from YouTube
    const linkTemplates = [
        "https://youtu.be/",
        "https://youtube.com/watch?",
        "https://www.youtu.be/",
        "https://www.youtube.com/watch?",
    ];
    let isLinkValid = false;
    for (const linkTemplate of linkTemplates) {
        isLinkValid = isLinkValid || args[0].startsWith(linkTemplate);
        if (isLinkValid) {
            break;
        }
    }
    if (!isLinkValid) {
        message.channel.send("You must provide a YouTube link.");
        throw new UsageError("Invalid link");
    }
    return args[0];
}

function playSong(song, connection, message, channel) {
    const dispatcher = connection.play(song, {
        filter: "audioonly",
        quality: "highestaudio",
    });
    dispatcher.on("start", () => {
        log.debug(f("play", "Playing..."));
        message.channel.send("Playing");
    });
    dispatcher.on("finish", () => {
        log.debug(f("play", "Song has finished."));
        message.channel.send("Finished");
        channel.leave();
        log.debug(f("play", "Left the voice channel."));
    });
    dispatcher.on("error", (error) => {
        message.channel.send("Ran into an error when playing.");
        log.debug(f("play", error));
        channel.leave();
        log.debug(f("play", "Left the voice channel."));
    });
}
