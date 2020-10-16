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

    // Returned mentioned users
    if (message.mentions.members.size > 0) {
        return message.mentions.members;
    } else {
        return null;
    }
}

function destroyIntervals(message, mentions, args) {
    // Clear explicit mentions
    if (mentions !== null) {
        for (const mention of mentions.keys()) {
            const guildMemberId = mentions.get(mention).user.id;
            const interval = message.client.activeIntervals.get(guildMemberId);
            message.client.clearInterval(interval);
            message.client.activeIntervals.delete(guildMemberId);
            console.log(message.client.activeIntervals);
        }
    }

    // Clear everyone if args is null
    if (args.length == 1 && args[0] === 'all') {
        for (const guildMemberId of message.client.activeIntervals.keys()) {
            const interval = message.client.activeIntervals.get(guildMemberId);
            message.client.clearInterval(interval);
            message.client.activeIntervals.delete(guildMemberId);
            console.log(message.client.activeIntervals);
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
        const mentions = processInput(message, args);
        destroyIntervals(message, mentions, args);
        // Validating arguments
        // logger.debug(format('revive', 'revive.js - Validating arguments'));
        // if (args.length != 1) {
        //     throw new UsageError('User mention not specified');
        // }
        // const client = message.client;
        // if (!client.activeIntervals.has(args[0])) {
        //     message.channel.send(
        //         "Can't revive a member who isn't being killed."
        //     );
        //     throw new ExecutionError('User not being killed.');
        // }
        // logger.debug(format('revive', 'revive.js - Arguments validated'));

        // logger.debug(
        //     format('revive', 'revive.js - Reviving, removing from intervals...')
        // );
        // const interval = client.activeIntervals.get(args[0]);
        // logger.debug(format('revive', `revive.js - interval: ${interval}`));
        // client.activeIntervals.delete(args[0]);
        // client.clearInterval(interval);
        // logger.debug(format('revive', 'revive.js - Removed interval.'));
        // logger.debug(
        //     format(
        //         'revive',
        //         `revive.js - client.activeIntervals: ${client.activeIntervals}`
        //     )
        // );
    },
};
