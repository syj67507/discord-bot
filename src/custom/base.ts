import { CommandInteraction, GuildMember } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export interface Option {
    /** The default name of the option */
    name: string;
    /** A short description of the option */
    description: string;
    /** Whether the option is required for the command to function */
    required: boolean;
    /** The type of the option (uses Discord's API to fetch available types)
     * import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
     */
    type: ApplicationCommandOptionTypes;
}

export async function parseOptions(
    interaction: CommandInteraction,
    command: Command
): Promise<any> {
    console.log("parseOptions");

    // Fetch command's definition for options/arguments
    const optionsDefinition = command.options;

    const result: any = {};
    result["raw"] = interaction.options.data;

    for (const option of optionsDefinition) {
        const parsedOption = interaction.options.get(option.name); // option/argument from user
        let parsedValue: string | number | boolean | GuildMember | null | undefined =
            null;

        // If passed an appropriate option, then appropriately fetch the values
        if (parsedOption) {
            switch (option.type as number) {
                case ApplicationCommandOptionTypes.BOOLEAN:
                case ApplicationCommandOptionTypes.INTEGER:
                case ApplicationCommandOptionTypes.NUMBER:
                case ApplicationCommandOptionTypes.STRING:
                    parsedValue = parsedOption.value;
                    break;
                case ApplicationCommandOptionTypes.USER:
                    parsedValue = parsedOption.member as GuildMember; // member object contains GuildMember and User object
                    break;
                default:
                    parsedValue = null;
            }
        }

        result[option.name] = parsedValue;
    }

    return result;
}

/**
 * Defines a Command and how to configure.
 */
export interface Command {
    /** The default name of the command */
    name: string;
    /** A short description of the command */
    description: string;
    /** The configuration information about the arguments of the command.
     * See the Argument interface for more detailed information
     */
    options: Option[];
    /**
     * The function to run when the command is triggered
     *
     * @param { Message } message The message that invoked this command
     * @param { ArgumentValues } options The arguments that were passed to this command
     * @returns { Promise<null> } null if no error is thrown
     */
    run: (interaction: CommandInteraction, options: any) => Promise<null>;
    /** The aliases that can also trigger the command */
    aliases?: string[];
    /** Defines whether the command is enabled for use */
    enabled: boolean | "fixed";
    /**
     * Additional information about the command that is displayed in the specific
     * help message.
     */
    additionalHelpInfo?: string[];
}
