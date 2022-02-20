import { CommandInteraction } from "discord.js";
import { Command, OptionType } from "../../custom/base";
import { format as f, logger as log } from "../../custom/logger";
import AudioManager, { Track } from "../../custom/audioManager";
import { YTClient } from "../../custom/ytclient";
import "dotenv/config";
// import playCommand from "./play";

const name = "queue";

const queueCommand: Command = {
    name: name,
    description: "Queues a music track.",
    additionalHelpInfo: [
        "**Special Cases:**",
        `\`${name}\` with no arguments displays a preview of the queue`,
        `\`}${name}\` clears/empties the queue`,
        `\`${name} --playlist playlistLink\` will queue up a youtube playlist`,
    ],
    aliases: ["q"],
    options: [
        {
            name: "track",
            type: OptionType.String,
            description:
                "The search phrase for YouTube search, direct YouTube video link, or direct YouTube playlist link",
            required: false,
        },
        {
            name: "playlist",
            type: OptionType.Boolean,
            description: "Whether or not the provided track link is a playlist",
            required: false,
        },
        {
            name: "position",
            type: OptionType.Integer,
            description: "Where to add this track to the queue",
            required: false,
        },
    ],
    enabled: true,
    async run(interaction: CommandInteraction, args: any): Promise<null> {
        await interaction.deferReply();
        const mm = AudioManager.getInstance(interaction.client, interaction.guildId!);
        // determine the queue position/offset
        log.debug(f("queue", "Determining the queue position/offset"));
        let queuePosition = mm.queueLength(); // default to the end of the queue

        // Verify provided position paramter
        if (args.position !== null && args.position > -1) {
            log.debug(
                f(
                    "queue",
                    "Position flag detected. Parsing provided position parameter..."
                )
            );
            queuePosition = args.position;
        }
        log.debug(f("queue", `queue position/offset set at: ${queuePosition}`));

        const trackString = args.track;

        // Displays queue on no track name passed
        if (trackString === null) {
            log.debug(f("queue", "Displaying queue..."));
            if (mm.queueLength() > 0) {
                interaction.editReply(
                    [
                        `Currently Queued: ${mm.queueLength()}`,
                        ...mm.getQueuePreview(),
                    ].join("\n")
                );
            } else {
                interaction.editReply("No tracks left in queue.");
            }
            return null;
        }

        // Clears queue if specified
        if (trackString === "clear") {
            log.debug(f("queue", "Clearing queue..."));
            mm.clearQueue();
            log.debug(f("queue", "Queue cleared."));
            interaction.editReply("Queue has been cleared.");
            return null;
        }

        // Try to get a Track for what the user provides and add it to the queue
        const yt = new YTClient();
        let tracks: Track[] | null = null;

        // If the user wants a playlist, try to get a playlist
        const playlistFlag = args.playlist !== null ? args.playlist : false;
        if (playlistFlag) {
            log.debug(f("queue", `Playlist Flag ${playlistFlag} detected`));
            const playlistLink = trackString.replace(playlistFlag, "").trim();
            log.debug(f("queue", `Trying to get a playlist from '${playlistLink}'`));
            try {
                tracks = await yt.getPlaylist(playlistLink);
            } catch (error) {
                log.debug(
                    f("queue", `Unable to retrieve playlist: ${(error as Error).message}`)
                );
            }
        }

        // Try to get the video directly
        if (tracks === null && !playlistFlag) {
            log.debug(f("queue", `Trying to get a direct video from '${trackString}'`));
            try {
                tracks = [await yt.getVideo(trackString)];
            } catch (error) {
                log.debug(
                    f(
                        "queue",
                        `Unable to retrieve video from direct link: ${
                            (error as Error).message
                        }`
                    )
                );
            }
        }

        // Try to search for the video
        if (!tracks && !playlistFlag) {
            log.debug(f("queue", `Trying to search YouTube for '${trackString}'`));
            try {
                tracks = [await yt.search(trackString)];
            } catch (error) {
                log.debug(
                    f(
                        "queue",
                        `Unable to retrieve a video search result: ${
                            (error as Error).message
                        }`
                    )
                );
            }
        }

        // Send error message if no Track(s) could be found
        if (!tracks) {
            log.debug(f("queue", `Couldn't find anything for '${trackString}'`));
            console.log("deferred", interaction.deferred);
            interaction.editReply(
                [
                    `Couldn't find anything for \`${trackString}\``,
                    "Either the search had no results or the search failed.",
                    "A restart may be necessary... @Bonk",
                ].join("\n")
            );
            return null;
        }
        for (const i in tracks) {
            mm.queue(tracks[i], queuePosition + parseInt(i));
        }
        log.debug(f("queue", `Queued track(s): ${JSON.stringify(tracks)}`));
        // // Only display queue message to channel if not called internally by play command
        // // Different behavior if this was called from play command internally
        // const ogCommand = message.content
        //     .slice(prefix.length)
        //     .split(/[ ]+/)
        //     .shift()!
        //     .toLowerCase();
        // const calledFromPlay =
        //     ogCommand === playCommand.name || playCommand.aliases?.includes(ogCommand);
        // if (!calledFromPlay) {
        //     message.reply([
        //         `Currently Queued: ${mm.queueLength()}`,
        //         ...mm.getQueuePreview(),
        //     ]);
        // }
        interaction.editReply(mm.getQueuePreview().join("\n"));
        return null;
    },
};

export default queueCommand;
