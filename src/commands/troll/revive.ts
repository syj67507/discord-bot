import { KillIntervals } from "../../custom/storage";
import { CommandInteraction, GuildMember } from "discord.js";
import { Command, OptionTypes } from "../../custom/base";
import { format as f, logger as log } from "../../custom/logger";
import { clearInterval } from "timers";

const reviveCommand: Command = {
    name: "revive",
    description: "Revives a member from that is being killed.",
    enabled: true,
    options: [
        {
            name: "user",
            description: "Who is to be revived?",
            type: OptionTypes.USER,
            required: false,
        },
    ],
    async run(interaction: CommandInteraction, options: any): Promise<null> {
        const intervals = KillIntervals.getInstance();
        const owners: string[] = ["108726505688862720"]; // @Bonk

        log.debug(f("revive", `Member Id to revive: ${options.user}`));
        const invoker = interaction.member as GuildMember;
        if (owners.includes(invoker.id)) {
            log.debug(f("revive", "Client owner override."));
        }
        if (options.user.id === invoker.id && !owners.includes(invoker.id)) {
            interaction.reply("You cannot revive yourself");
            return null;
        }
        if (!intervals.has(options.user.id)) {
            interaction.reply(`${options.user} not being killed.`);
            return null;
        }

        // Member found, revive...
        const interval = intervals.get(options.user.id);

        clearInterval(interval!);
        log.debug(f("revive", `Interval cleared: ${options.user.id}`));
        interaction.reply(`${options.user} revived.`);
        intervals.delete(options.user.id);

        return null;
    },
};

export default reviveCommand;
