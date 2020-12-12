const { logger: log, format: f } = require("../custom/logger");

module.exports = {
    name: "vibecheck",
    description: "I give you rating on how much you are vibin'!",
    usage: `
        ${process.env.PREFIX}vibecheck
        `,
    async execute(message, args) {
        message.channel.send(Math.ceil(Math.random() * 20));
    },
};
