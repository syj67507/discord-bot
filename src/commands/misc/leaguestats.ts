import { CommandInteraction } from "discord.js";
import { Command } from "../../custom/base";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const leagueStatsCommand: Command = {
    name: "leaguestats",
    description: "Sends the op.gg profile of requested user (North American Region)",
    aliases: ["ls", "opgg"],
    options: [
        {
            name: "username",
            description: "Username of requested league account.",
            required: false,
            type: ApplicationCommandOptionTypes.STRING,
        },
    ],
    enabled: true,
    async run(interaction: CommandInteraction, args: any) {
        const input = args.username as string;
        const leagueURL: URL = searchLeagueName(input);
        await interaction.reply(leagueURL.href);
        return null;
    },
};

/**
 * Attaches username to the end of the op.gg URL to redirect to exact summoner page.
 * @param {string} input The username inputted by the user
 * @returns {URL} The new URL with the summoner name attached to the end
 */
export function searchLeagueName(input: string): URL {
    const leagueURL = new URL("https://na.op.gg/summoner/userName=" + input);
    return leagueURL;
}

export default leagueStatsCommand;
