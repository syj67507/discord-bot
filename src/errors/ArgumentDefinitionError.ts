import { Argument } from "../custom/base";

export class ArgumentDefinitionError extends Error {
    /**
     * Constructs an ArgumentRuntimeError for argument definitions.
     * @param arg The argument definition that caused an error.
     */
    constructor(msg: string, arg?: Argument | Argument[]) {
        const message =
            "The following argument definition caused an error." +
            `${JSON.stringify(arg)}` +
            `\n${msg}`;
        super(message);
        this.name = "ArgumentRuntimeError";
    }
}
