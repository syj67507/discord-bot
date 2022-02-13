import { CommandInteraction, Collection } from "discord.js";
import { Command, Option, OptionType } from "../../custom/base";

const helpCommand: Command = {
    name: "help",
    description: "Provides help information about all available commands",
    options: [
        {
            name: "command",
            description: "The command to receive information for",
            required: false,
            type: OptionType.String,
        },
    ],
    aliases: ["h"],
    enabled: true,
    async run(
        interaction: CommandInteraction,
        options: any,
        commands: Collection<string, Command>,
        commandGroups: Collection<string, string[]>
    ): Promise<null> {
        let helpMessage: string[] = [];

        // Based on input, fill in the helpMessage
        const commandName = options.command as string;
        if (commandName === null) {
            helpMessage = HelpCommandHelpers.makeHelpAllMessage(
                "/",
                commands,
                commandGroups
            );
        } else if (commandName === "help") {
            helpMessage = HelpCommandHelpers.makeSpecificHelpMessage(this);
        } else if (commands.has(commandName)) {
            const command = commands.get(commandName)!;
            helpMessage = HelpCommandHelpers.makeSpecificHelpMessage(command);
        } else {
            helpMessage = [
                `Unable to identify ${commandName} command. Use the help ` +
                    "command to see a list of all the available commands.",
            ];
        }
        // else if (commandAliases.has(commandName)) {
        //     const cmdName = commandAliases.get(commandName)!;
        //     const command = commands.get(cmdName)!;
        //     helpMessage = makeSpecificHelpMessage(command);
        // }

        interaction.reply({
            content: helpMessage.join("\n"),
            ephemeral: true,
        });
        return null;
    },
};

export class HelpCommandHelpers {
    /**
     * Takes a string and returns a string where the first letter is capitalized like a title
     * @param s The string to capitalize
     * @returns {string} The string that has been capitalized
     */
    static capitalize(s: string): string {
        if (s.length === 0) {
            return s;
        }
        return s.slice(0, 1).toUpperCase() + s.slice(1);
    }

    /**
     * Returns an array of messages that contains information about all commands and how to use them
     * @param prefix The command prefix for this client
     * @param cmds The collection that contains all of the command definitions (from loadedCommands)
     * @param cmdGroups The collection that contains all the groups and all of its commands (from loadedCommands)
     * @returns {string[]} The help message
     */
    static makeHelpAllMessage(
        prefix: string,
        // eslint-disable-next-line no-shadow
        cmds: Collection<string, Command>,
        // eslint-disable-next-line no-shadow
        cmdGroups: Collection<string, string[]>
    ): string[] {
        const helpMessage = [
            `To run a command, use \`${prefix}command\` in any text channel provided on the server.`,
            `Use \`${prefix}help <command>\` to view detailed information about a specific command.`,
            "Any commands that are ~~crossed out~~ are currently disabled.",
            "",
            "__**Available commands**__",
            "",
        ];

        for (const commandGroupName of cmdGroups.keys()) {
            const commandGroup = cmdGroups.get(commandGroupName)!;
            helpMessage.push(`__${this.capitalize(commandGroupName)}__`);

            for (const commandName of commandGroup) {
                const command = cmds.get(commandName)!;
                let m = `**${command.name}:** ${command.description}`;
                if (command.enabled === false) {
                    m = `~~${m}~~`;
                }
                helpMessage.push(m);
            }

            // Special case since help is not loaded at the time of this commands definition

            helpMessage.push("");
        }
        return helpMessage;
    }

    /**
     * Makes a help message for a specific command
     * @param command The command to make a help message for
     * @returns {string[]} An array of strings of all the command details
     */
    static makeSpecificHelpMessage(command: Command): string[] {
        const {
            aliases,
            description,
            enabled,
            name,
            options: options,
            additionalHelpInfo,
        } = command;

        const msg = [
            `__Command **${name}**__`,
            description,
            `Currently ${enabled === false ? "**disabled**" : "**enabled**"}`,
            "",
        ];

        if (aliases && aliases.length > 0) {
            msg.push(`**Aliases:** \`[${aliases}]\``);
        }

        if (additionalHelpInfo && additionalHelpInfo.length > 0) {
            msg.push("", ...additionalHelpInfo, "");
        }

        if (options.length > 0) {
            const { usageOptions, argDetails: optionDetails } =
                this.makeArgDescriptions(options);
            msg.push(
                `**Usage:** \`${name} ${usageOptions}\``,
                "",
                "**Options:**",
                ...optionDetails
            );
        }

        return msg;
    }

    /**
     * Returns an object that parses the passed options for use in generating a help message
     * @param options: an array of options
     * @returns usageOptions, a string with all arguments
     * @returns argDetails, an array where each entry is detailed information about an argument
     */
    static makeArgDescriptions(options: Option[]): any {
        let usageOptions = "";
        const optionDetails: string[] = [];
        for (const option of options) {
            const { name, description } = option;
            usageOptions += `<${name}> `;
            const optionDescription = `\`<${name}>\` ${description}`;
            optionDetails.push(optionDescription);
        }
        return { usageOptions, argDetails: optionDetails };
    }
}
export default helpCommand;
