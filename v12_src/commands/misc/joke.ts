import { Message } from "discord.js";
import { Command } from "../../custom/base";
import axios from "axios";
import { logger as log, format as f } from "../../custom/logger";

const jokeCommand: Command = {
    name: "joke",
    aliases: ["dadjoke", "jokes"],
    description: "Sends a dad joke!",
    arguments: [],
    enabled: true,
    async run(message: Message) {
        log.debug(f("joke", "Fetching the joke..."));
        const res = await axios.get("https://icanhazdadjoke.com/slack", {
            headers: {
                "User-Agent": "No Hands Discord Bot",
            },
        });
        let joke: string = res.data.attachments[0].text;

        log.debug(f("joke", "Processing response..."));
        joke = appendEmoji(joke);
        log.debug(f("joke", `Joke: ${joke}`));

        log.debug(f("joke", "Sending to channel..."));
        message.reply(joke);
        return null;
    },
};

/**
 * Appends an emoji to the end of the joke.
 * @param {string} joke The joke returned from the axios call
 * @returns {string} The joke with the emoji appended at the end
 */
export function appendEmoji(joke: string): string {
    let jokeWithEmoji = joke;
    if (Math.floor(Math.random() * 2) == 0) {
        jokeWithEmoji += " :rofl:";
    } else {
        jokeWithEmoji += " :joy:";
    }
    return jokeWithEmoji;
}

export default jokeCommand;
