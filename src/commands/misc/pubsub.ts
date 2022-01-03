import { Message } from "discord.js";
import { Command } from "../../custom/base";
import axios from "axios";
import { logger as log, format as f } from "../../custom/logger";
import { Messages } from "../../custom/messages";

const pubsubCommand: Command = {
    name: "pubsub",
    description: "Responds with if the Publix chicken tender sub is on sale or not.",
    aliases: ["publixsublix", "publix"],
    enabled: true,
    arguments: [],
    async run(message: Message) {
        const response = await axios.get("https://arepublixchickentendersubsonsale.com/");
        ("");
        log.debug(f("pubsub", response.data));
        const m = new Messages();
        if (response.data.includes("Not this week my dudes")) {
            message.channel.send(m.get("pubsubNotOnSale"));
        } else {
            message.channel.send(m.get("pubsubOnSale"));
        }
        return null;
    },
};

export default pubsubCommand;
