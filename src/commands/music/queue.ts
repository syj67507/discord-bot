import { CommandoMessage, Command, CommandoClient } from "discord.js-commando";
import { format as f, logger as log } from "../../custom/logger";
import MusicManager from "../../custom/music-manager";

module.exports = class QueueCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "queue",
            group: "music",
            memberName: "queue",
            description: "Queues a music track.",
            argsPromptLimit: 0,
            args: [
                {
                    key: "track",
                    prompt: "What do you want to queue up?",
                    error: "No search phrase given",
                    type: "string",
                    default: "",
                },
            ],
        });
    }

    async run(message: CommandoMessage, args: any) {
        const mm = MusicManager.getInstance(this.client);

        // Displays queue on no track name passed
        const playlist = ["Currently Queued: "];
        if (args.track === "") {
            log.debug(f("queue", "Displaying queue..."));
            if (mm.queueLength() === 0) {
                return message.reply("No tracks left in queue.");
            }

            // Fetching all tracks in queue/playlist
            for (const track of mm.playlist) {
                playlist.push(track.title);
            }
            return message.reply(playlist);
        }

        // Clears queue if specified
        if (args.track === "clear") {
            log.debug(f("queue", "Clearing queue..."));
            mm.clearQueue();
            log.debug(f("queue", "Queue cleared."));
            return message.reply("Queue has been cleared.");
        }

        log.debug(f("queue", `Searching YT for ${args.track}`));
        try {
            const track = await mm.search(args.track);
            mm.queue(track);
            log.debug(f("queue", `Queued: ${track.link}`));
            return message.reply(`Queued: ${track.title}`);
        } catch (error) {
            log.error(f("queue", error));
            return message.reply(`Couldn't find a link for \`${args.track}\``);
        }
    }
};
