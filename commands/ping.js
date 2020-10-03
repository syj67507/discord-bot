const { logger, format } = require("../logger");

module.exports = {
    name: 'ping',
    description: 'Ping!',
    async execute(message, args) {
        logger.debug(format('ping', 'Sending...'));
        message.channel.send('Pong.');
        logger.debug(format('ping', 'Sent'));
    },
};
