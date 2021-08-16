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
            validator: (value: number) => [5, 4, 3].includes(value),
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
