import {
    CommandoMessage,
    Command,
    CommandoClient,
    ArgumentInfo,
} from "discord.js-commando";
import axios from "axios";
import { logger as log, format as f } from "../../custom/logger";

module.exports = class JokeCommand extends (
    Command
) {
    constructor(client: CommandoClient) {
        super(client, {
            name: "joke",
            aliases: ["jokes", "dadjoke"],
            group: "misc",
            memberName: "joke",
            description: "Sends a dad joke!",
        });
    }

    async run(message: CommandoMessage) {
        log.debug(f("joke", "Fetching the joke..."));
        const res = await axios.get("https://icanhazdadjoke.com/slack");
        let joke: string = res.data.attachments[0].text;

        log.debug(f("joke", "Processing response..."));
        joke = appendEmoji(joke);
        log.debug(f("joke", `Joke: ${joke}`));

        log.debug(f("joke", "Sending to channel..."));
        return message.reply(joke);
    }
};

/**
 * Appends an emoji to the end of the joke.
 * @param {string} joke The joke returned from the axios call
 * @returns {string} The joke with the emoji appended at the end
 */
function appendEmoji(joke: string): string {
    if (Math.floor(Math.random() * 2) == 0) {
        joke += " :rofl:";
    } else {
        joke += " :joy:";
    }
    return joke;
}
