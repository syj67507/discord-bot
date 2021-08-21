import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";

const meowCommand: Command = {
    name: "meow",
    description: "Kitty Cat replies with Meow!",
    aliases: ["cat", "kitten", "kit"],
    enabled: true,
    arguments: [
        {
            key: "key1",
            type: "number",
            description: "whether to throw an error",
            default: "google",
            validator: (value: number) => [5, 4, 3].includes(value),
        },
        {
            key: "key2",
            type: "string",
            description: "whether to throw an error",
        },
    ],
    async run(message: Message, args: ArgumentValues) {
        if (args.error === "error") {
            throw new Error("asdf");
        }
        message.channel.send("Meow!");
        return null;
    },
};

export default meowCommand;
