import { KillIntervals } from "../../custom/storage";
import { GuildMember, Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";
import { format as f, logger as log } from "../../custom/logger";

const reviveCommand: Command = {
    name: "revive",
    description: "Revives a member from that is being killed.",
    enabled: true,
    arguments: [
        {
            key: "members",
            description: "Who is to be revived?",
            type: "user",
        },
    ],
    async run(message: Message, args: ArgumentValues): Promise<null> {
        const intervals = KillIntervals.getInstance();
        const owners: string[] = ["108726505688862720"];
        // for (const user of message.client.owners) {
        //     owners.push(user.id);
        // }

        for (const member of [args.members as GuildMember]) {
            log.debug(f("revive", `Member ID: ${member}`));
            if (owners.includes(message.member!.id)) {
                log.debug(f("revive", "Client owner override."));
            }
            if (
                member.id === message.member!.id &&
                !owners.includes(message.member!.id)
            ) {
                message.reply("You cannot revive yourself");
                return null;
            }
            if (!intervals.has(member.id)) {
                message.reply(`${member} not being killed.`);
                return null;
            }

            // Member found, revive...
            const interval = intervals.get(member.id);
            message.client.clearInterval(interval!);
            log.debug(f("revive", `Interval cleared: ${member.id}`));
            message.channel.send(`${member} revived.`);
            intervals.delete(member.id);
        }
        return null;
    },
};

export default reviveCommand;
