import { Message } from "discord.js";
import { Command } from "../../custom/base";
import axios from "axios";
import { logger as log, format as f } from "../../custom/logger";

const pubsubCommand: Command = {
    name: "pubsub",
    description: "Responds with if the Publix chicken tender sub is on sale or not.",
    aliases: ["publixsublix", "publix"],
    enabled: true,
    arguments: [],
    async run(message: Message) {
        const response = await axios.get("https://arepublixchickentendersubsonsale.com/");
        log.debug(f("pubsub", response.data));
        if (response.data.includes("Not this week my dudes")) {
            message.channel.send("The Publix chicken tender sandwich is NOT on sale.");
        } else {
            message.channel.send("The publix chicken tender sandwich is on sale.");
        }
        return null;
    },
};

export default pubsubCommand;
