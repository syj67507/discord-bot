import { CommandInteraction } from "discord.js";
import { Command } from "../../custom/base";
import { ApplicationCommandOptionType } from "discord-api-types";
import { logger as log, format as f } from "../../custom/logger";

const opggCommand: Command = {
    name: "opgg",
    description: "Sends the op.gg profile of requested user (North American Region)",
    aliases: ["leaguestats"],
    options: [
        {
            name: "username",
            description: "Username of requested league account.",
            required: false,
            type: ApplicationCommandOptionType.String,
        },
    ],
    enabled: true,
    async run(interaction: CommandInteraction, args: any) {
        log.debug(f("leaguestats", "Fetching user info..."));
        const input = args.username as string;
        log.debug(f("leaguestats", "Entering into URL..."));
        const leagueURL = new URL("https://na.op.gg/summoner/userName=" + input);
        log.debug(f("leaguestats", `LeagueURL: ${leagueURL}`));
        log.debug(f("leaguestats", "Printing to channel..."));
        await interaction.reply(leagueURL.href);
        return null;
    },
};

export default opggCommand;
