import { KillIntervals } from "../../custom/storage";
import { CommandInteraction } from "discord.js";
import { Command } from "../../custom/base";

const hitListCommand: Command = {
    name: "hitlist",
    description: "Displays killed people in the server in a hitlist.",
    aliases: ["hl", "killList"],
    options: [],
    enabled: true,
    async run(interaction: CommandInteraction) {
        const intervals = KillIntervals.getInstance();
        const keys = intervals.keys();
        const members = [];

        if (intervals.size == 0) {
            interaction.reply("No one is currently killed in the server!");
        } else {
            for (const id of keys) {
                members.push("<@!" + id + ">");
                interaction.reply("People currently killed in the server: " + members);
            }
        }
        return null;
    },
};

export default hitListCommand;
