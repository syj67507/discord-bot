const { logger: log, format: f } = require("../custom/logger");

module.exports = {
    name: "vibecheck",
    description: "I give you rating on how much you are vibin'!",
    usage: `
        ${process.env.PREFIX}vibecheck
        `,
    async execute(message, args) {
        const value = Math.ceil(Math.random() * 20);
        let response = [value];
        if (value === 20) {
            response.push("We vibin'! (~‾▿‾)~");
        }
        message.channel.send(response);
    },
};
