import { KillIntervals } from "../../custom/storage";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { GuildMember, User } from "discord.js";
import { format as f, logger as log } from "../../custom/logger";

module.exports = class ReviveCommand extends (
    Command
) {
    constructor(client: CommandoClient) {
        super(client, {
            name: "revive",
            group: "troll",
            memberName: "revive",
            description: "Revives a member from that is being killed.",
            argsPromptLimit: 0,
            args: [
                {
                    key: "members",
                    prompt: "Who is to be revived?",
                    error: "Provide a member",
                    type: "member",
                    infinite: true,
                },
            ],
        });
    }
    run(message: CommandoMessage, args: any) {
        const intervals = KillIntervals.getInstance();
        const owners: string[] = [];
        for (const user of this.client.owners) {
            owners.push(user.id);
        }

        for (const member of args.members) {
            log.debug(f("revive", `Member ID: ${member}`));
            if (owners.includes(message.member.id)) {
                log.debug(f("revive", "Client owner override."));
            }
            if (
                member.id === message.member.id &&
                !owners.includes(message.member.id)
            ) {
                return message.reply("You cannot revive yourself");
            }
            if (!intervals.has(member.id)) {
                return message.reply(`${member} not being killed.`);
            }

            // Member found, revive...
            const interval = intervals.get(member.id);
            this.client.clearInterval(interval!);
            log.debug(f("revive", `Interval cleared: ${member.id}`));
            message.say(`${member} revived.`);
            intervals.delete(member.id);
        }
        return null;
    }
};
