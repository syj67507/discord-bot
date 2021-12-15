import { CommandInteraction } from "discord.js";
import { Command } from "../../custom/base";

const pingCommand: Command = {
    name: "ping",
    description: "Pings the bot",
    options: [],
    enabled: true,
    async run(interaction: CommandInteraction) {
        await interaction.reply("Pong!");
        return null;
    },
};

export default pingCommand;
