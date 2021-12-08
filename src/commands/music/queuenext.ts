import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";
import { format as f, logger as log } from "../../custom/logger";
import queueCommand from "./queue";

const queuenextCommand: Command = {
    name: "queuenext",
    aliases: ["qnext", "qn"],
    enabled: true,
    description: "Queues up a music track to the beginning of the queue.",
    arguments: [
        {
            key: "track",
            type: "string",
            description:
                "The search phrase for YouTube search, direct YouTube video link, or direct YouTube playlist link",
            infinite: true,
        },
    ],
    async run(message: Message, args: ArgumentValues) {
        const trackString = (args.track as string[]).join(" ");
        log.debug(f("queuenext", `trackString: '${trackString}'`));

        // Try to queue up a track to front of queue using the queue command
        // eslint-disable-next-line no-param-reassign
        message.content = message.content + " --position 1";
        (args.track as string[]).push("--position", "1");

        log.info(
            f("queuenext", `Internally calling queueCommand with '${message.content}'`)
        );
        await queueCommand.run(message, args);
        log.info(f("queuenext", "Returned back from queueCommand"));

        return null;
    },
};

export default queuenextCommand;
