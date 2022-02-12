import { Message } from "discord.js";
import { Command } from "../../custom/base";
import axios from "axios";

const html2json = require('html2json').html2json;

const pubsubCommand: Command = {
    name: "pubsub",
    description: "Responds with what publix sub is on sale for the week and how much it is.",
    aliases: ["publixsublix", "publix"],
    enabled: true,
    arguments: [],
    async run(message: Message) {
        const response = await axios.get("https://pubsub.club/")
        const htmlResponse = response.data.replace('<!doctype html>', '');
        const jsonResponse = (html2json(htmlResponse));
        const name = JSON.stringify((jsonResponse.child[0].child[1].child[0].child[1].child[0].child[0].text),null,2);
        const newName = name.replace("&#39;","'").replace(/"/g,'');
        const price = JSON.stringify((jsonResponse.child[0].child[1].child[0].child[1].child[1].child[0].text),null,2);
        const newPrice = price.replace(/"/g,'');
        message.channel.send("Name of sub on sale this week: " + newName + "\n" + "Price: " + newPrice);
        return null;
    },
};

export default pubsubCommand;
