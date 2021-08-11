import { Message } from "discord.js";

/**
 * @property name: The name of the command
 * @property description: The description of the command
 * @property run: The function to run the command
 * @property parseArgs: The function to parse the message for arguments for this command
 * @property aliases: The aliases that can also run this command
 * @property group: The name of the group to place this command under
 */
export interface Command {
    name: string;
    description: string;
    run: runFunction;
    arguments: Argument[];
    aliases?: string[];
    group?: string;
}

export interface Argument {
    key: string;
    type: string;
    description: string;
    default?: any;
}

type parseArgsFunction = (args: string) => any[] | string;
type runFunction = (message: Message, args: any) => Promise<null>;

export function parseArgs(rawArgs: string[], argsInfo?: Argument[]): ArgumentValues {
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
    console.log(result);
    return result;
}

export type ArgumentValues = {
    [key: string]: any;
};
