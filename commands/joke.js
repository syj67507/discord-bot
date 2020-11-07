const { executionAsyncResource } = require("async_hooks");
const axios = require("axios");
const log = require("../custom/logger.js").logger;
const f = require("../custom/logger.js").format;
const ExecutionError = require("../custom/ExecutionError");

/**
 *
 * @param {string} joke The joke returned from the axios call
 * @returns {string}    The joke with the emoji appended at the end
 */
function appendEmoji(joke) {
    if (Math.floor(Math.random() * 2) == 0) {
        joke += " :rofl:";
    } else {
        joke += " :joy:";
    }
    return joke;
}

module.exports = {
    name: "joke",
    description: "Sends a dad joke!",
    usage: `
        ${process.env.PREFIX}joke
        `,
    async execute(message, args) {
        try {
            log.debug(f("joke", "Fetching the joke..."));
            const res = await axios.get("https://icanhazdadjoke.com/slack");
            let joke = res.data.attachments[0].text;

            log.debug(f("joke", "Processing response..."));
            joke = appendEmoji(joke);

            log.debug(f("joke", "Sending to channel..."));
            message.channel.send(joke);
        } catch {
            message.channel.send(
                "Sorry... there I couldn't get you a joke :frowning:"
            );
            throw new ExecutionError("Error in fetching the joke.");
        }
    },
};
