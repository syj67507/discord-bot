import { KillIntervals } from "../../custom/storage";
import {
    CommandoMessage,
    Command,
    CommandoClient,
    ArgumentInfo,
} from "discord.js-commando";
import { MembershipStates, Message, SystemChannelFlags } from "discord.js";

module.exports = class HitListCommand extends (Command) {
    constructor(client: CommandoClient) {
        super(client, {
            name: "hitlist",
            group: "troll",
            memberName: "hitlist",
            description: "Displays killed people in the server in a hitlist.",
        });
    }

    async run(message: CommandoMessage, args: any) {
        return message.say("People currently killed in the server: " + killedPeople());
    }
};


/**
 * Returns values of killed users of a server in an array.
 * @returns {members} array of killed users in a server.
 */

function killedPeople() {
    const intervals = KillIntervals.getInstance();
    const keys = intervals.keys();
    const members = [];

    for(const id of keys) {
        members.push("<@!" + id + ">");
    }

    return members;

}