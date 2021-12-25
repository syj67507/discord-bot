import { KillIntervals } from "../../custom/storage";
import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";

const HitListCommand: Command = {
            name: "hitlist",
            description: "Displays killed people in the server in a hitlist.",
            aliases: ["hl", "killList"],
            arguments: [],
        enabled: true,
        async run(message: Message, args: any) {
             message.channel.send("People currently killed in the server: " + killedPeople());
             return null;
    }
};


/**
 * Returns values of killed users of a server in an array.
 * @returns {string[]} array of killed users in a server.
 */

export function killedPeople() {
    const intervals = KillIntervals.getInstance();
    const keys = intervals.keys();
    const members = [];

    for(const id of keys) {
        members.push("<@!" + id + ">");
    }

    return members;

}