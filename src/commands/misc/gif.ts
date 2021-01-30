import {
    CommandoMessage,
    Command,
    CommandoClient,
    ArgumentInfo,
} from "discord.js-commando";
import GphApiClient from "giphy-js-sdk-core";
import { logger as log, format as f } from "../../custom/logger";

module.exports = class GifCommand extends (
    Command
) {
    constructor(client: CommandoClient) {
        super(client, {
            name: "gif",
            aliases: ["giphy", "giffy"],
            group: "misc",
            memberName: "gif",
            description: "Gives back a gif based on your search term",
            argsPromptLimit: 0,
            args: [
                {
                    key: "search",
                    prompt: "What should I search of a gif of?",
                    error: "Provide a search term",
                    type: "string",
                },
            ],
        });
    }

    async run(message: CommandoMessage, args: any) {
        // Set up Giphy client
        require("dotenv").config();
        const gifToken = process.env.GIF_TOKEN;
        const gifClient = GphApiClient(gifToken);
        log.debug(f("gif", "Created Giphy Client"));

        // Fetch a gif
        log.debug(f("gif", `Searching for: ${args.search}`));
        const response = await gifClient.search("gifs", { q: args.search });
        log.debug(f("gif", `Number of results: ${response.data.length}`));
        const randomIndex = Math.floor(Math.random() * response.data.length);
        log.debug(f("gif", "Sending image to channel..."));
        message.say("", {
            files: [response.data[randomIndex].images.fixed_height.url],
        });
        log.debug(f("gif", "Image retrieved from API and sent to channel."));
        return null;
    }
};
