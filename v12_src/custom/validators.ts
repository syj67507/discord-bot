/**
 * This file contains validator functions for each of the types allowed
 * for command arguments. Validators should return the parsed value or
 * undefined if unable to successfully parse.
 */

/**
 * Validates the incoming value to see if it is a number. If it is not a number,
 * it will return undefined
 * @param value The string value that should contain a number
 * @returns The passed in string as a number or undefined if it cannot be parsed.
 */
export function validateNumber(value: string): number | undefined {
    const x = parseFloat(value);
    if (Number.isNaN(x)) {
        return undefined;
    }
    return x;
}

const truthyValues = new Set(["1", "yes", "y", "true"]);
const falsyValues = new Set(["0", "no", "n", "false"]);
/**
 * Validates the incoming value to see if its a boolean value. If it is not a boolean
 * value, it will returned undefined.
 *
 * truthyValues: ["1", "yes", "y", "true"]
 *
 * falsyValues: ["0", "no", "n", "false"]
 * @param value The string value that should contain a boolean value
 * @returns A boolean based on the value or undefined if it cannot be parsed.
 */
export function validateBoolean(value: string): boolean | undefined {
    if (truthyValues.has(value)) return true;
    if (falsyValues.has(value)) return false;
    return undefined;
}
