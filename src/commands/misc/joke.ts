import { CommandInteraction } from "discord.js";
import { Command } from "../../custom/base";
import axios from "axios";
import { logger as log, format as f } from "../../custom/logger";

const jokeCommand: Command = {
    name: "joke",
    aliases: ["dadjoke", "jokes"],
    description: "Sends a dad joke!",
    options: [],
    enabled: true,
    async run(interaction: CommandInteraction) {
        log.debug(f("joke", "Fetching the joke..."));
        const res = await axios.get("https://icanhazdadjoke.com/slack", {
            headers: {
                "User-Agent": "No Hands Discord Bot",
            },
        });
        let joke: string = res.data.attachments[0].text;

        log.debug(f("joke", "Processing response..."));
        // Append an emoji to the end of the joke
        if (Math.floor(Math.random() * 2) == 0) {
            joke += " :rofl:";
        } else {
            joke += " :joy:";
        }
        log.debug(f("joke", `Joke: ${joke}`));

        log.debug(f("joke", "Sending to channel..."));
        await interaction.reply(joke);
        return null;
    },
};

export default jokeCommand;
