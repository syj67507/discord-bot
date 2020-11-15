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
        const voiceChannel = validateChannel(message);
        const songLink = validateLink(message, args);
        message.client.musicQueue.unshift(songLink);

        // Starts playing music from queue
        log.debug(f("play", "Joining voice channel..."));
        const connection = await voiceChannel.join();
        log.debug(f("play", "Retrieving song..."));
        playSong(message, connection, voiceChannel);
    },
    validateLink,
};

/**
 * Validates whether the user that invoked this command is in a voice channel.
 * Throws a UsageError if a voice channel is invalid.
 *
 * @param {Discord.Message} message The message that invoked this command.
 * @returns Returns the voice channel
 */
function validateChannel(message) {
    // Check if the user is in a voice channel
    const channel = message.member.voice.channel;
    if (channel == null) {
        message.channel.send("You've got to join a voice channel.");
        throw new UsageError("User not in voice channel");
    }
    return channel;
}

/**
 * Validates that the arguments contains only on YouTube link.
 * Throws a UsageError if the link is invalid or if none is provided.
 *
 * @param {Discord.Message} message The message that invoked this command.
 * @param {Array} args An array of the arguments passed with this command.
 * @returns The YouTube link
 */
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

/**
 * Plays the next song found within the client's music queue and sends a message to the
 * text channel providing the song title. This function is called recursively until there
 * are no more song in the queue. Once finished, the client will leave the voice channel.
 *
 * @param {Discord.Message} message The message that invoked this command.
 * @param {Discord.VoiceConnection} connection The client's connection to the voice channel.
 * @param {Discord.VoiceChannel} voiceChannel The voice channel where the user is in.
 */
function playSong(message, connection, voiceChannel) {
    // Plays the next song in the queue
    const musicQueue = message.client.musicQueue;
    const songLink = message.client.musicQueue.shift();
    const song = ytdl(songLink);
    const dispatcher = connection.play(song, {
        filter: "audioonly",
        quality: "highestaudio",
    });

    dispatcher.on("start", async () => {
        log.debug(f("play", "Now Playing..."));
        try {
            const songInfo = await ytdl.getBasicInfo(songLink);
            message.channel.send(
                `Now Playing: *${songInfo.videoDetails.title}*`
            );
        } catch (e) {
            log.error(e.message);
            message.channel.send(`Now Playing: []`);
        }
    });

    // Plays the next song or leaves if there isn't one
    dispatcher.on("finish", () => {
        log.debug(f("play", "Song has finished."));
        log.debug(f("play", "Songs left in queue: " + musicQueue.length));

        if (musicQueue.length > 0) {
            log.debug(f("play", "Fetching next song in queue..."));
            playSong(message, connection, voiceChannel);
        } else {
            log.debug(f("play", "No more songs left in queue."));
            message.channel.send("No more songs left in queue.");
            voiceChannel.leave();
            log.debug(f("play", "Left the voice channel."));
        }
    });

    dispatcher.on("error", (error) => {
        message.channel.send("Ran into an error when playing.");
        log.debug(f("play", error));
        voiceChannel.leave();
        log.debug(f("play", "Left the voice channel."));
    });
}
