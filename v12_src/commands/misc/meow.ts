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
            type: "user",
            description: "whether to throw an error",
        },
    ],
    async run(message: Message, args: ArgumentValues) {
        message.channel.send("Meow!");
        return null;
    },
};

export default meowCommand;
