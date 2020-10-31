class ExecutionError extends Error {
    constructor(...params) {
        super(...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ExecutionError);
        }
        this.name = "ExecutionError";
    }
}

module.exports = ExecutionError;
