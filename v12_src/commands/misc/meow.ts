import { Message } from "discord.js";
import { Command } from "../base";

const command: Command = {
    name: "meow",
    description: "Kitty Cat replies with Meow!",
    arguments: [
        {
            key: "testing",
            type: "string",
            description: "this is a test argument",
            default: "asdf",
        },
    ],
    async run(message) {
        return null;
    },
    parseArgs(message) {
        return message;
    },
    aliases: ["cat"],
    group: "misc",
};

export default command;
