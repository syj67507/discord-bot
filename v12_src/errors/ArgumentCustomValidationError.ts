import { Argument } from "../custom/base";

export class ArgumentCustomValidationError extends Error {
    /**
     * Constructs an ArgumentCustomValidationError for when the user did not pass in a
     * valid value for the defined argument for the custom validator function.
     * @param argumentInfo The configuration information of the problematic argument
     * @param value The value that was unable to parse
     */
    constructor(argumentInfo: Argument, value: string) {
        super(
            `The value '${value}' is not within the parameters of` +
                ` this argument '${argumentInfo.key}'.`
        );
        this.name = "ArgumentCustomValidationError";
        this.validator = argumentInfo.validator?.toString();
    }
    validator?: string;
}
