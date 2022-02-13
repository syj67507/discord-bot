import { Message } from "discord.js";
import { Command } from "../../custom/base";
import axios from "axios";

// Does not have TypeScript support, using require syntax
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { html2json } = require("html2json");

const pubsubCommand: Command = {
    name: "pubsub",
    description:
        "Responds with what publix sub is on sale for the week and how much it is.",
    aliases: ["publixsublix", "publix"],
    enabled: true,
    arguments: [],
    async run(message: Message) {
        const response = await axios.get("https://pubsub.club/");
        const htmlResponse = response.data.replace("<!doctype html>", "");

        const json = html2json(htmlResponse);
        const name = json.child[0].child[1].child[0].child[1].child[0].child[0].text
            .replace("&#39;", "'")
            .replace(/"/g, "");
        const price =
            json.child[0].child[1].child[0].child[1].child[1].child[0].text.replace(
                /"/g,
                ""
            );

        message.channel.send(`**${name}**\nPrice: ${price}`);
        return null;
    },
};

export default pubsubCommand;
