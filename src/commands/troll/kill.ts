import { KillIntervals } from "../../custom/storage";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Collection, GuildMember } from "discord.js";
import { format as f, logger as log } from "../../custom/logger";

module.exports = class KillCommand extends (
    Command
) {
    constructor(client: CommandoClient) {
        super(client, {
            name: "kill",
            group: "troll",
            memberName: "kill",
            description:
                "Kicks a member from voice chat every set amount of time until revived.",
            argsPromptLimit: 0,
            args: [
                {
                    key: "member",
                    prompt: "Who is going to be killed?",
                    error: "Provide a member",
                    type: "member",
                },
                {
                    key: "interval",
                    prompt: "How often are you going to kill?",
                    error: "The interval is not long enough",
                    type: "integer",
                    validate: (interval: number) => interval >= 5,
                    default: 5,
                },
            ],
        });
    }
    run(message: CommandoMessage, args: any) {
        // Check permissions
        const authorRole = message.member.roles.highest;
        const subjectRole = args.member.roles.highest;
        if (authorRole.comparePositionTo(subjectRole) < 0) {
            log.debug(
                f("kill", "Permissions of subject are higher than author's.")
            );
            return message.reply(
                "You do not have permissions to kill this member."
            );
        }

        // Check if interval is already initialized
        const intervals = KillIntervals.getInstance();
        if (intervals.has(args.member.id)) {
            log.debug(f("kill", "Clearing existing interval for reset."));
            const interval = intervals.get(args.member.id);
            this.client.clearInterval(interval!);
            intervals.delete(args.member.id);
        }

        // Init kill interval
        log.debug(f("kill", `Member ID: ${args.member.id}`));
        const interval = this.client.setInterval(
            async (
                member: GuildMember,
                message: CommandoMessage,
                intervals: Collection<string, NodeJS.Timer>
            ) => {
                try {
                    if (member.voice.channel) {
                        log.debug(f("kill", "Kicking member..."));
                        await member.voice.setChannel(null);
                        log.debug(f("kill", "Member kicked."));
                    }
                } catch (error) {
                    message.say(
                        `Can't kill ${member}, removing from kill list`
                    );
                    const interval = intervals.get(member.id);
                    message.client.clearInterval(interval!);
                    intervals.delete(member.id);
                    log.debug(
                        f("kill error", `Interval cleared: ${member.id}`)
                    );
                }
            },
            args.interval * 1000,
            args.member,
            message,
            intervals
        );
        // Store the interval for use in revival
        intervals.set(args.member.id, interval);
        log.debug(f("kill", "Interval set."));
        return null;
    }
};
