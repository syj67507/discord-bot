import { Message } from "discord.js";
import { Command } from "../../custom/base";

const meowCommand: Command = {
    name: "meow",
    description: "Kitty Cat replies with Meow!",
    aliases: ["cat", "kitten", "kit"],
    enabled: true,
    arguments: [],
    async run(message: Message) {
        message.channel.send("Meow!");
        return null;
    },
};

export default meowCommand;
