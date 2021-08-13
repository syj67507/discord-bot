import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";

const command: Command = {
    name: "meow",
    description: "Kitty Cat replies with Meow!",
    arguments: [
        {
            key: "key1",
            type: "string",
            description: "key1 description",
        },
        {
            key: "key2",
            type: "string",
            description: "key2 description",
        },
        {
            key: "key3",
            type: "number2",
            description: "key3 description",
        },
    ],
    async run(message: Message, args: ArgumentValues) {
        console.log(args);
        message.channel.send("Meow!");
        return null;
    },
    aliases: ["cat", "kitten", "kit"],
};

export default command;
