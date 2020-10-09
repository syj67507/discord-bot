const { logger, format } = require('../logger');

module.exports = {
    name: 'ping',
    description: 'The bot sends back Pong!',
    usage: `
    ${process.env.PREFIX}ping
    `,
    async execute(message, args) {
        logger.debug(format('ping', 'Sending...'));
        message.channel.send('Pong.');
        logger.debug(format('ping', 'Sent'));
    },
};
