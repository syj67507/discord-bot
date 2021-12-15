import { CommandInteraction } from "discord.js";
import { Command } from "../../custom/base";

const meowCommand: Command = {
    name: "meow",
    description: "Kitty Cat replies with Meow!",
    aliases: ["cat", "kitten", "kit"],
    enabled: true,
    options: [],
    async run(interaction: CommandInteraction) {
        await interaction.reply("Meow!");
        return null;
    },
};

export default meowCommand;
