const { Collection } = require('discord.js');
const ExecutionError = require('../custom_errors/execution_error');
const UsageError = require('../custom_errors/usage_error');
const { logger, format } = require('../logger');

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
    message.channel.send('processInput');
    // There must be at least one argument
    if (args.length < 1) {
        throw new UsageError('Did not mention anybody');
    }

    // Return 'all' of the ids
    if (args.length === 1 && args[0] === 'all') {
        return message.client.activeIntervals.keyArray();
    }

    // Check for mentioned users
    if (message.mentions.members.size < 1) {
        throw new UsageError('Did not mention anybody');
    }

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
        }
        // Notify if the member is not being killed
        else {
            message.channel.send(`<@${memberId}> is not on the hit list.`);
        }
    }
}

module.exports = {
    name: 'revive',
    description: 'Reverses the kill command on the specified user',
    usage: `
        ${process.env.PREFIX}revive <@userMention>
        `,
    async execute(message, args) {
        message.channel.send('revive');
        const members = processInput(message, args);
        destroyIntervals(message, members);
    },
};
