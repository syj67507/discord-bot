import { Message } from "discord.js";
import { Command } from "../../custom/base";
import { Messages } from "../../custom/messages";

const meowCommand: Command = {
    name: "meow",
    description: "Kitty Cat replies with Meow!",
    aliases: ["cat", "kitten", "kit"],
    enabled: true,
    arguments: [],
    async run(message: Message) {
        const m = new Messages();
        message.channel.send(m.get("meow"));
        return null;
    },
};

export default meowCommand;
