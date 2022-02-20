import { CommandInteraction, GuildMember } from "discord.js";
import { Command, OptionType } from "../../custom/base";
import { format as f, logger as log } from "../../custom/logger";
import AudioManager from "../../custom/audioManager";
import queueCommand from "./queue";

const prefix = process.env.PREFIX;
const name = "play";

const playCommand: Command = {
    name: name,
    aliases: ["p"],
    enabled: true,
    description: "Plays a music track.",
    additionalHelpInfo: [
        "**Special Cases:**",
        `\`${prefix}${name}--playlist playlistLink\` will play a youtube playlist`,
        `\`${prefix}${name}\` will play from the queue if not empty`,
    ],
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
    ],
    async run(interaction: CommandInteraction, args: any, ...rest) {
        await interaction.deferReply();
        const client = interaction.client;
        const mm = AudioManager.getInstance(client, interaction.guildId!);

        const trackString = args.track;
        log.debug(f("play", `trackString: '${trackString}'`));

        if (mm.isPlaying() && !trackString) {
            interaction.editReply(
                "I am currently playing... use next to skip to the next song"
            );
            return null;
        }

        // Try to queue up a track to front of queue using the queue command
        if (trackString) {
            log.info(f("play", "Internally calling queueCommand"));
            const queueOptions = {
                track: args.track,
                playlist: args.playlist,
                position: 0,
            };
            await queueCommand.run(interaction, queueOptions, ...rest);
            log.info(f("play", "Returned back from queueCommand"));
        }

        // Exits if the queue is empty and no track was provided
        if (mm.queueLength() < 1) {
            interaction.editReply("There is nothing to play.");
            return null;
        }

        // Connects and plays
        log.debug(f("play", "Not currently playing. Connecting..."));
        try {
            await mm.connect((interaction.member as GuildMember)!.voice!.channel!);
            log.debug(f("play", "Connected."));
        } catch (error) {
            log.error(f("play", `${error}`));
            if (trackString) {
                log.error(f("play", "Removing track due to error"));
                mm.playlist.shift();
            }
            interaction.editReply(
                "Unable to join voice channel. " +
                    "Make sure to be a voice channel when using this command."
            );
            return null;
        }
        mm.start();
        return null;
    },
};

export default playCommand;
