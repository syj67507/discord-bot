import { Message } from "discord.js";
import { ArgumentValues, Command } from "../base";

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
    async run(message, args: ArgumentValues) {
        console.log("Inside Meow Command - args:", args);
        message.channel.send("Meow!");
        return null;
    },
    aliases: ["cat"],
    group: "misc",
};

export default command;
