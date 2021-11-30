import { Guild, GuildMember, Message } from "discord.js";
import { ArgumentCustomValidationError } from "../errors/ArgumentCustomValidationError";
import { ArgumentDefinitionError } from "../errors/ArgumentDefinitionError";
import { ArgumentUsageError } from "../errors/ArgumentUsageError";
import { validateNumber, validateBoolean, validateUser } from "./validators";

/**
 * Defines a Command argument and how to configure one
 */
export interface Argument {
    /** The key to reference this argument */
    key: string;
    /**
     * The type of this argument (number|string|boolean|user)
     */
    type: "number" | "string" | "boolean" | "user";
    /** The description of what this argument is */
    description: string;
    /** The default value of this argument if nothing is passed */
    default?: any;
    /** A validator function to run on the argument.
     * Expects the parameter type to be the same as the argument.type*/
    validator?: (value: any) => boolean;
    /** Whether or not this argument takes infinite number of values.
     * Will return an array of the defined type. Can only be defined
     * for the last argument if there are multiple arguments defined.
     */
    infinite?: boolean;
}

/**
 * @property full - The full string of all the argument values passed in
 * @property remaining - If there are more args passed in than defined,
 * the remaining will be populated here
 * @property all other properties can be referenced by this.key
 * @example args.key1
 * @example args.full
 */
export type ArgumentValues = {
    /** Key/Value pair of the argument */
    [key: string]:
        | string
        | string[]
        | number
        | number[]
        | boolean
        | boolean[]
        | GuildMember
        | GuildMember[]
        | undefined;
};

/**
 * Parses the arguments from a string with the provided argument information,
 * retrieved from a Command.arguments definition.
 * @param rawArgs The raw string containing all of the arguments to be parsed
 * @param argsInfo An array of the configuration argument information for each argument
 * @param guild The guild where the command was triggered from (used for fetching guildMembers for user arguments)
 * @throws ArgumentUsageError | ArgumentDefinitionError | ArgumentCustomValidationError
 * @returns An ArgumentValues structure containing key value pairs for each argument definition.
 */
export async function parseArgs(
    rawArgs: string[],
    argumentsInfo: Argument[],
    guild: Guild | any
): Promise<ArgumentValues> {
    // Check if keys are valid, otherwise throw ArgumentDefinitionError
    const keyCheck = argumentsInfo.map((argumentInfo) => {
        return argumentInfo.key;
    });
    if (new Set(keyCheck).size !== keyCheck.length) {
        // Duplicate keys
        throw new ArgumentDefinitionError(
            `Argument Keys: [${keyCheck.toString()}] are not valid.` +
                "There may be duplicates.",
            argumentsInfo
        );
    }
    if (keyCheck.includes("full") || keyCheck.includes("remaining")) {
        // Reserved
        throw new ArgumentDefinitionError(
            `Argument Keys: [${keyCheck.toString()}] are not valid. ` +
                "The keys [full, remaining] are reserved.",
            argumentsInfo
        );
    }

    // Need a copy to prevent modification of original command argument definition
    const argsInfo = [...argumentsInfo];
    const argValues = [...rawArgs];

    const result: ArgumentValues = {
        full: argValues.join(" "),
    };

    while (argsInfo.length > 0) {
        const arg = argsInfo.shift()!;
        let value = argValues.shift()!;

        // If no value passed but a default is defined
        if (!value && arg.default !== undefined) {
            value = `${arg.default}`;
        }

        // If no value passed and no default defined
        if (!value && arg.default === undefined) {
            throw new ArgumentUsageError(arg, value);
        }

        // If infinite, combine argument values and loop through
        if (arg.infinite === true) {
            if (argsInfo.length !== 0) {
                throw new ArgumentDefinitionError(
                    "Arguments with the infinite flag must be set only for the final argument.",
                    arg
                );
            }
            argValues.unshift(value);
            value = argValues.join(" ");
            while (argValues.length > 0) {
                argValues.shift();
            }
        }

        // Validate and parse the value
        let parsedValue: any[];
        switch (arg.type) {
            case "string":
                parsedValue = value.split(" ");
                break;
            case "number":
                parsedValue = value.split(" ").map((val) => validateNumber(val));
                break;
            case "boolean":
                parsedValue = value.split(" ").map((val) => validateBoolean(val));
                break;
            case "user":
                parsedValue = [] as (GuildMember | undefined)[];
                for (const val of value.split(" ")) {
                    parsedValue.push(await validateUser(val, guild));
                }
                break;
        }

        // Uses custom validator if one is passed
        let valid = true;
        for (const val of parsedValue) {
            if (arg.validator) {
                valid = valid && arg.validator(val);
                if (valid === false) {
                    // caught in command execution
                    throw new ArgumentCustomValidationError(arg, value);
                }
            }
        }

        // Throw usage error if validators returned undefined
        if (parsedValue.includes(undefined)) {
            throw new ArgumentUsageError(arg, value);
        }

        // Parse values as an array if infinite flag is true
        result[arg.key] = arg.infinite ? parsedValue : parsedValue[0];
    }

    if (argValues.length > 0) {
        result["remaining"] = argValues.join(" ");
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
    arguments: Argument[];
    /**
     * The function to run when the command is triggered
     *
     * @param { Message } message The message that invoked this command
     * @param { ArgumentValues } args The arguments that were passed to this command
     * @returns { Promise<null> } null if no error is thrown
     */
    run: (message: Message, args: ArgumentValues) => Promise<null>;
    /** The aliases that can also trigger the command */
    aliases?: string[];
    /** Defines whether the command is enabled for use */
    enabled: boolean | "fixed";
}
