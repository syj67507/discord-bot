class UsageError extends Error {
    constructor(...params) {
        super(...params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UsageError);
        }
        this.name = 'UsageError';
    }
}

module.exports = UsageError;