import { Message } from "discord.js";
import { ArgumentRuntimeError } from "../errors/ArgumentRuntimeError";
import { ArgumentUsageError } from "../errors/ArgumentUsageError";
import { validateNumber, validateBoolean } from "./validators";

export interface Argument {
    /**The key to reference this argument */
    key: string;
    /**The type of this argument (number|string|boolean) */
    type: "number" | "string" | "boolean";
    /**The description of what this argument is */
    description: string;
    /**The default value of this argument if nothing is passed */
    default?: any;
}

/**
 * @property full - The full string of all the argument values passed in
 * @property remaining - If there are more args passed in than defined,
 * the remaining will be populated here
 */
export type ArgumentValues = {
    /**Key/Value pair of the argument */
    [key: string]: string | number | boolean | undefined;
};

/**
 * Parses the arguments from a string with the provided argument information,
 * retrieved from a Command.arguments definition.
 * @param rawArgs The raw string containing all of the arguments to be parsed
 * @param argsInfo An array of the configuration argument information for each argument
 * @returns An ArgumentValues structure containing key value pairs for each argument definition.
 */
export function parseArgs(rawArgs: string[], argumentsInfo: Argument[]): ArgumentValues {
    // If no arguments defined for command, return empty arguments object
    if (!argumentsInfo) {
        return {};
    }

    // Check if keys are valid, otherwise throw ArgumentKeyError
    const keyCheck = argumentsInfo.map((argumentInfo) => {
        return argumentInfo.key;
    });
    if (new Set(keyCheck).size !== keyCheck.length) {
        // Duplicate keys
        throw new ArgumentRuntimeError(keyCheck.toString());
    }
    if (keyCheck.includes("full") || keyCheck.includes("remaining")) {
        // Reserved
        throw new ArgumentRuntimeError(keyCheck.toString());
    }

    // Need a copy to prevent modification of original command argument definition
    const argsInfo = [...argumentsInfo];

    const result: ArgumentValues = {
        full: rawArgs.join(" "),
    };

    while (argsInfo.length) {
        const arg = argsInfo.shift()!;
        let value = rawArgs.shift()!;

        // If no value passed but a default is defined
        if (!value && arg.default) {
            value = arg.default;
        }

        // If no value passed and no default defined
        if (!value && !arg.default) {
            throw new ArgumentUsageError(arg, value);
        }

        // Validate and parse the value
        let parsedValue: string | number | boolean | undefined;
        switch (arg.type) {
            case "string":
                parsedValue = value;
                break;
            case "number":
                parsedValue = validateNumber(value);
                break;
            case "boolean":
                parsedValue = validateBoolean(value);
                break;
            default:
                // Shouldn't ever enter here
                throw new Error(
                    "Entered default switch case. You somehow entered an invalid argument type: " +
                        arg.type
                );
        }

        // Throw usage error if validators did not return a valid for argument
        if (parsedValue) {
            result[arg.key] = parsedValue;
        } else {
            throw new ArgumentUsageError(arg, value);
        }
    }

    if (rawArgs.length > 0) {
        result["remaining"] = rawArgs.join(" ");
    }

    return result;
}

export interface Command {
    /**The default name of the command */
    name: string;
    /**A short description of the command */
    description: string;
    /**The configuration information about the arguments of the command */
    arguments: Argument[];
    /**The function to run when the command is triggerd */
    run: (message: Message, args: ArgumentValues) => Promise<null>;
    /**The aliases that can also trigger the command */
    aliases?: string[];
}
