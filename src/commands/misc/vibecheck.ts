import { CommandInteraction } from "discord.js";
import { Command } from "../../custom/base";

const vibecheckCommand: Command = {
    name: "vibecheck",
    aliases: ["roll", "vc"],
    description: "Rolls a d20 to see how much we vibin'! ",
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

export default vibecheckCommand;
