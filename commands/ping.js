const { logger: log, format: f } = require("../custom/logger");

module.exports = {
    name: "ping",
    description: "The bot sends back Pong!",
    usage: `
        ${process.env.PREFIX}ping
        `,
    async execute(message, args) {
        log.debug(f("ping", "Sending..."));
        message.channel.send("Pong.");
        log.debug(f("ping", "Sent"));
    },
};
