export class ArgumentRuntimeError extends Error {
    /**
     * Constructs an ArgumentRuntimeError for argument definitions.
     * @param type The argument type definition that caused an error.
     */
    constructor(key: string) {
        const message =
            `Argument Keys: [${key}] are not valid. There are duplicates` +
            " or keys contain reserved values 'full' or 'remaining'";
        super(message);
        this.name = "ArgumentRuntimeError";
    }
}