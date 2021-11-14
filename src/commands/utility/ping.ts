import { Message } from "discord.js";
import { Command } from "../../custom/base";

const pingCommand: Command = {
    name: "ping",
    description: "Pings the bot",
    arguments: [],
    enabled: true,
    async run(message: Message) {
        message.reply("Pong!");
        return null;
    },
};

export default pingCommand;
