const UsageError = require("../custom/UsageError");
const log = require("../custom/logger").logger;
const f = require("../custom/logger").format;

module.exports = {
    name: "revive",
    description: "Reverses the kill command on the specified user",
    usage: `
        ${process.env.PREFIX}revive <@userMention>
        ${process.env.PREFIX}revive all
        `,
    async execute(message, args) {
        log.debug(
            f("revive", `Active Intervals: ${message.client.activeIntervals}`)
        );
        const members = processInput(message, args);
        log.debug(f("revive", `Members: ${members}`));
        destroyIntervals(message, members);
        log.debug(
            f("revive", `Active Intervals: ${message.client.activeIntervals}`)
        );
    },
};

/**
 * Processes the incoming message that initiated the command.
 * If there are mentions, it will return those mentions. If not,
 * it will return null.
 *
 * @param {Discord.Message} message The incoming message.
 * @param {Array}           args    The arguments of the command.
 *
 * @returns {Discord.Collection}    The explicitly mentioned users, otherwise null
 */
function processInput(message, args) {
    // There must be at least one argument
    if (args.length < 1) {
        throw new UsageError("Did not mention anybody");
    }

    // Return 'all' of the ids
    if (args.length === 1 && args[0] === "all") {
        log.debug(f("revive", "Retrieving all members..."));
        return message.client.activeIntervals.keyArray();
    }

    // Check for mentioned users
    if (message.mentions.members.size < 1) {
        throw new UsageError("Did not mention anybody");
    }

    log.debug(f("revive", "Retrieving mentioned members..."));
    return message.mentions.members.keyArray();
}

/**
 * Destroys the intervals that are set from the kill command for the given
 * members.
 *
 * @param {Discord.Message} message Message that invoked this command.
 * @param {Array}           members Array of the members to revive.
 */
function destroyIntervals(message, members) {
    for (const memberId of members) {
        // Clear the intervals for each provided member
        if (message.client.activeIntervals.has(memberId)) {
            const interval = message.client.activeIntervals.get(memberId);
            message.client.clearInterval(interval);
            message.client.activeIntervals.delete(memberId);
            message.channel.send(`<@${memberId}> revived.`);
            log.debug(f("revive", `Revived: ${memberId}`));
        } else {
            // Notify if the member is not being killed
            message.channel.send(`<@${memberId}> is not on the hit list.`);
            log.debug(f("revive", `Revive failed: ${memberId}`));
        }
    }
}
