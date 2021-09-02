import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";

const leagueStatsCommand: Command = {
    name: "leaguestats",
    description: "Sends the op.gg profile of requested user (North American Region)",
    aliases: ["ls", "opgg"],
    arguments: [
        {
            key: "leagueUsernameInput",
            type: "string",
            description: "Username of requested league account.",
        },
    ],
    enabled: true,
    async run(message: Message, args: ArgumentValues) {
        const input = args.leagueUsernameInput as string;
        const leagueURL: URL = searchLeagueName(input);
        message.channel.send(leagueURL.href);
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
