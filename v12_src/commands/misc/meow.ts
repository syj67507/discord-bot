import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";

const command: Command = {
    name: "meow",
    description: "Kitty Cat replies with Meow!",
    arguments: [
        {
            key: "key1",
            type: "number",
            description: "whether to throw an error",
            default: "google",
        },
        {
            key: "error",
            type: "string",
            description: "another string",
        },
    ],
    async run(message: Message, args: ArgumentValues) {
        if (args.error === "error") {
            throw new Error("asdf");
        }
        message.channel.send("Meow!");
        return null;
    },
    aliases: ["cat", "kitten", "kit"],
};

export default command;
