import { CommandInteraction } from "discord.js";
import { Command, OptionTypes } from "../../custom/base";

const opggCommand: Command = {
    name: "opgg",
    description: "Sends the op.gg profile of requested user (North American Region)",
    aliases: ["leaguestats"],
    options: [
        {
            name: "username",
            description: "Username of requested league account.",
            required: false,
            type: OptionTypes.STRING,
        },
    ],
    enabled: true,
    async run(interaction: CommandInteraction, args: any) {
        const input = args.username as string;
        const leagueURL = new URL("https://na.op.gg/summoner/userName=" + input);
        await interaction.reply(leagueURL.href);
        return null;
    },
};

export default opggCommand;
