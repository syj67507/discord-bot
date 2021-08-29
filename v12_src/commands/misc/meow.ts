import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";

const meowCommand: Command = {
    name: "meow",
    description: "Kitty Cat replies with Meow!",
    aliases: ["cat", "kitten", "kit"],
    enabled: true,
    arguments: [],
    async run(message: Message, args: ArgumentValues) {
        message.channel.send("Meow! " + args.key1);
        return null;
    },
};

export default meowCommand;
