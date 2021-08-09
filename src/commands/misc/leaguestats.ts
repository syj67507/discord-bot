import {
    CommandoMessage,
    Command,
    CommandoClient,
    ArgumentInfo,
} from "discord.js-commando";
import { link } from "fs";

module.exports = class LeagueStatsCommand extends (Command) {
    constructor(client: CommandoClient) {
        super(client, {
            name: "leaguestats",
            group: "misc",
            memberName: "leaguestats",
            description: "Sends the op.gg profile of requested user (North American Region)",
            aliases: ["ls", "opgg"],
            args: [{
                type: "string",
                key: "leagueUsernameInput",
                default: "",
                prompt: "Username of requested league account.",
            },]
        });
    }

    async run(message: CommandoMessage, args: any) {
        const leagueURL: URL = searchLeagueName(args.leagueUsernameInput);
        message.say(leagueURL.href);
        return null;
    }
};

/**
 * Attaches username to the end of the op.gg URL to redirect to exact summoner page.
 * @param {string} input The username inputted by the user
 * @returns {URL} The new URL with the summoner name attached to the end
 */
function searchLeagueName(input: string) {
    const leagueURL = new URL('https://na.op.gg/summoner/userName=' + input);
    return leagueURL;
}

