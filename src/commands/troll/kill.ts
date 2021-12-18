import { KillIntervals } from "../../custom/storage";
import { Command, OptionTypes } from "../../custom/base";
import { GuildMemberRoleManager } from "discord.js";
import { CommandInteraction, Collection, GuildMember } from "discord.js";
import { format as f, logger as log } from "../../custom/logger";
import { clearInterval, setInterval } from "timers";

const killCommand: Command = {
    name: "kill",
    description: "Kicks a member from voice chat every set amount of time until revived.",
    enabled: true,
    options: [
        {
            name: "member",
            description: "Who is going to be killed?",
            type: OptionTypes.USER,
            required: true,
        },
        {
            name: "interval",
            description: "How often to kill the user in seconds, must be 5 or greater",
            type: OptionTypes.INTEGER,
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
            async (
                member: GuildMember,
                i: CommandInteraction,
                intrvls: Collection<string, NodeJS.Timer>
            ) => {
                try {
                    const channel = member.voice.channel;
                    if (channel) {
                        log.debug(f("kill", `${member.user.tag} in #${channel.name}`));
                        log.debug(f("kill", "Kicking member..."));
                        await member.voice.setChannel(null);
                        log.debug(f("kill", "Member kicked."));
                    }
                } catch (error) {
                    i.channel!.send(`Can't kill ${member}, removing from hit list`);
                    const intervalToClear = intrvls.get(member.id);
                    clearInterval(intervalToClear!);
                    intrvls.delete(member.id);
                    log.debug(f("kill error", `Interval cleared: ${member.id}`));
                }
            },
            (interval as number) * 1000,
            target,
            interaction,
            intervals
        );
        // Store the interval for use in revival
        intervals.set(target.id, killInterval);
        log.debug(f("kill", "Interval set."));
        interaction.reply(`${target} is now on the hit list.`);
        return null;
    },
};

export default killCommand;
