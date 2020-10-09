const ExecutionError = require('../custom_errors/execution_error');
const UsageError = require('../custom_errors/usage_error');
const { logger, format } = require('../logger');

module.exports = {
    name: 'revive',
    description: 'Reverses the kill command on the specified user',
    usage:
        `
        ${process.env.PREFIX}revive <@userMention>
        `,
    async execute(message, args) {

        // Validating arguments
        logger.debug(format('revive', 'revive.js - Validating arguments'));
        if (args.length != 1) {
            throw new UsageError('User mention not specified');
        }
        const client = message.client;
        if (!client.activeIntervals.has(args[0])) {
            message.channel.send('Can\'t revive a member who isn\'t being killed.');
            throw new ExecutionError('User not being killed.');
        }
        logger.debug(format('revive', 'revive.js - Arguments validated'));

        logger.debug(format('revive', 'revive.js - Reviving, removing from intervals...'));
        const interval = client.activeIntervals.get(args[0]);
        logger.debug(format('revive', `revive.js - interval: ${interval}`));
        client.activeIntervals.delete(args[0]);
        client.clearInterval(interval);
        logger.debug(format('revive', 'revive.js - Removed interval.'));
        logger.debug(format('revive', `revive.js - client.activeIntervals: ${client.activeIntervals}`));
    },
};
