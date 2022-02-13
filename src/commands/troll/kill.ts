import { KillIntervals } from "../../custom/storage";
import { Command, OptionType } from "../../custom/base";
import { Collection, GuildMemberRoleManager } from "discord.js";
import { CommandInteraction, GuildMember } from "discord.js";
import { format as f, logger as log } from "../../custom/logger";

const killCommand: Command = {
    name: "kill",
    description: "Kicks a member from voice chat every set amount of time until revived.",
    enabled: true,
    options: [
        {
            name: "member",
            description: "Who is going to be killed?",
            type: OptionType.User,
            required: true,
        },
        {
            name: "interval",
            description: "How often to kill the user in seconds, must be 5 or greater",
            type: OptionType.Integer,
            required: false,
        },
    ],
    async run(interaction: CommandInteraction, options: any): Promise<null> {
        // Default interval option to 5 seconds
        let interval = options.interval;
        if (!interval) {
            log.debug(f("kill", "Interval option not passed, defaulting to 5"));
            interval = 5;
        }

        // Check permissions
        log.debug(f("kill", "Checking permissions..."));
        const target = options.member as GuildMember;
        const authorRole = (interaction.member!.roles as GuildMemberRoleManager).highest;
        const subjectRole = target.roles.highest;
        if (authorRole.comparePositionTo(subjectRole) < 0) {
            log.debug(
                f("kill", "Permissions of target are higher than author's. Cancelled.")
            );
            interaction.reply({
                content: "You do not have permissions to kill this member.",
                ephemeral: true,
            });
            return null;
        }
        log.debug(f("kill", "Permissions passed."));

        // Check if interval is already initialized
        log.debug(f("kill", "Check if interval is already initialized"));
        const intervals = KillIntervals.getInstance();
        if (intervals.has(target.id)) {
            log.debug(f("kill", "Clearing existing interval for reset."));
            const killInterval = intervals.get(target.id);
            clearInterval(killInterval!);
            intervals.delete(target.id);
        }

        // Init kill interval
        log.debug(f("kill", `Member ID: ${target.id}`));
        const killInterval = setInterval(
            (i: any, t: any, int: any) => KillHelper.kick(i, t, int),
            (interval as number) * 1000,
            interaction,
            target,
            intervals
        );
        // Store the interval for use in revival
        intervals.set(target.id, killInterval);
        log.debug(f("kill", "Interval set."));
        interaction.reply(`${target} is now on the hit list.`);
        return null;
    },
};

export class KillHelper {
    static async kick(
        interaction: CommandInteraction,
        target: GuildMember,
        intervals: Collection<string, NodeJS.Timeout>
    ): Promise<void> {
        try {
            const channel = target.voice.channel;
            if (channel) {
                log.debug(f("kill", `${target.user.tag} in #${channel.name}`));
                log.debug(f("kill", "Kicking member..."));
                await target.voice.setChannel(null);
                log.debug(f("kill", "Member kicked."));
            }
        } catch (e) {
            interaction.channel!.send(`Can't kill ${target}, removing from hit list`);
            const intervalToClear = intervals.get(target.id);
            clearInterval(intervalToClear!);
            intervals.delete(target.id);
            log.debug(f("kill error", `Interval cleared: ${target.id}`));
        }
    }
}

export default killCommand;
