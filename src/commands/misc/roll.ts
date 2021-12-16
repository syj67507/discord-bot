import { CommandInteraction } from "discord.js";
import { Command } from "../../custom/base";

const rollCommand: Command = {
    name: "roll",
    aliases: ["vibecheck", "vc"],
    description: "Rolls a d20, checking the vibe...",
    options: [],
    enabled: true,
    async run(interaction: CommandInteraction) {
        let response = `${Math.ceil(Math.random() * 20)}`;
        if (response === "20") {
            response = `${response} (~‾▿‾)~`;
        }
        await interaction.reply(response);
        return null;
    },
};

export default rollCommand;
