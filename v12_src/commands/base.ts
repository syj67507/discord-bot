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
    parseArgs: parseArgsFunction;
    arguments?: ArgumentInfo[];
    aliases?: string[];
    group?: string;
}

interface ArgumentInfo {
    key: string;
    type: string;
    description: string;
    default?: any;
}

type parseArgsFunction = (args: string) => any[] | string;
type runFunction = (message: Message, args: any) => Promise<null>;
