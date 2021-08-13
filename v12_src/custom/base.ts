import { Message } from "discord.js";

export interface Command {
    /**The default name of the command */
    name: string;
    /**A short description of the command */
    description: string;
    /**The configuration information about the arguments of the command */
    arguments: Argument[];
    /**The function to run when the command is triggerd */
    run: runFunction;
    /**The aliases that can also trigger the command */
    aliases?: string[];
}

export interface Argument {
    /**The key to reference this argument */
    key: string;
    /**The type of this argument (number|string|boolean) */
    type: string;
    /**The description of what this argument is */
    description: string;
    /**The default value of this argument if nothing is passed */
    default?: any;
}

type runFunction = (message: Message, args: ArgumentValues) => Promise<null>;

/**
 * Parses the arguments from a string with the provided argument information,
 * retrieved from a Command.arguments definition.
 * @param rawArgs The raw string containing all of the arguments to be parsed
 * @param argsInfo An array of the configuration argument information for each argument
 * @returns An ArgumentValues structure containing key value pairs for each argument definition.
 */
export function parseArgs(rawArgs: string[], argsInfo: Argument[]): ArgumentValues {
    // If no arguments defined for command, return empty arguments object
    if (!argsInfo) {
        return {};
    }

    // Need a copy to prevent modification of original command argument definition
    argsInfo = [...argsInfo];

    const result: ArgumentValues = {
        rawArgs: rawArgs.join(" "),
    };
    const length = argsInfo.length;
    // Loop through each ArgumentInfo and parse the appropriate value
    for (let i = 0; i < length; i += 1) {
        const arg = argsInfo[i];
        switch (arg.type) {
            case "string":
                result[arg.key] = rawArgs[i];
                break;
            case "number":
                result[arg.key] = parseInt(rawArgs[i]);
                break;
            default:
                result[arg.key] = undefined;
                // throw new Error(`${arg.type} Type not found`);
                break;
        }
    }
    return result;
}

export type ArgumentValues = {
    [key: string]: string | number | boolean | undefined;
};
