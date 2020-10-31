const log = require("../custom/logger").logger;
const f = require("../custom/logger").format;

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
