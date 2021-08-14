import { Argument } from "../custom/base";

export class ArgumentUsageError extends Error {
    /**
     * Constructs an ArgumentUsageError for when the user did not pass in a
     * valid value for the defined argument.
     * @param argumentInfo {string} The configuration information of the problematic argument
     * @param value The value that was unable to parse
     */
    constructor(argumentInfo: Argument, value: string) {
        const message =
            `Unable to parse argument '${argumentInfo.key}'` +
            ` into type '${argumentInfo.type}' from value '${value}'`;
        super(message);
        this.name = "ArgumentUsageError";
    }
}
