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
        const intervals = KillIntervals.getInstance();
        const keys = intervals.keys();
        const members = [];
        console.log(intervals.size);

        if (intervals.size == 0) {
            message.channel.send("No one is currently killed in the server!");
        } else {
            for (const id of keys) {
                members.push("<@!" + id + ">");
                message.channel.send("People currently killed in the server: " + members);
            }
        }
        return null;
    },
};

export default HitListCommand;
