const { executionAsyncResource } = require("async_hooks");
const axios = require("axios");
const log = require("../custom/logger.js").logger;
const f = require("../custom/logger.js").format;

module.exports = {
    name: "joke",
    description: "Sends a dad joke!",
    usage: `
        ${process.env.PREFIX}joke
        `,
    async execute(message, args) {
        try {
            const res = await axios.get("https://icanhazdadjoke.com/slack");
            let joke = res.data.attachments[0].text;
            if (Math.floor(Math.random() * 2) == 0) {
                joke += " :rofl:";
            } else {
                joke += " :joy:";
            }
            message.channel.send(joke);
        } catch {
            message.channel.send(
                "Sorry... there I couldn't get you a joke :frowning:"
            );
        }
    },
};
