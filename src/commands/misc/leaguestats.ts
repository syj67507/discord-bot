import {
    CommandoMessage,
    Command,
    CommandoClient,
    ArgumentInfo,
} from "discord.js-commando";
import axios from "axios";
import { link } from "fs";

module.exports = class LeagueStatsCommand extends (Command) {
    // Configuration
    constructor(client: CommandoClient) {
        super(client, {
            name: "leaguestats",
            group: "misc",
            memberName: "leaguestats",
            description: "Sends the op.gg profile of requested user (North American Region)",
            aliases: ["ls"],
            args: [{
                type: "string",
                key: "userInput",
                default: "",
                prompt: "Username of requsted league account.",
            },]
        });
    }

    // What makes the command do stuff
    async run(message: CommandoMessage, args: any) {
        console.log(args.userInput);
        const leagueURL: URL = searchLeagueName(args.userInput);
        message.say(leagueURL.href);
        return null;
    }
};

function searchLeagueName(input: string) {
    const leagueURL = new URL('https://na.op.gg/summoner/userName=' + input);
    return leagueURL;
}

