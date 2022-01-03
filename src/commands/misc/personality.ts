import { ArgumentValues, Command } from "../../custom/base";
import { Message } from "discord.js";
import { Messages } from "../../custom/messages";

const personalityCommand: Command = {
    name: "personality",
    description:
        "Changes the personality of the bot to one of the existing personalities.",
    enabled: true,
    arguments: [
        {
            key: "personality",
            type: "string",
            description: "The name of the personality to adopt.",
        },
    ],
    async run(message: Message, args: ArgumentValues) {
        const m = new Messages();
        m.setMODE(args.personality as string);
        return null;
    },
};

export default personalityCommand;
