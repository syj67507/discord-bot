const log = require("../custom/logger.js").logger;
const f = require("../custom/logger.js").format;

module.exports = {
    name: "joke",
    description: "Sends a dad joke!",
    usage: `
        ${process.env.PREFIX}joke
        `,
    async execute(message, args) {
        log.debug(f("joke", "Making a request..."));
        const https = require("https");
        https
            .get("https://icanhazdadjoke.com/slack", (res) => {
                // Receiving joke
                log.debug(f("joke", "Loading joke..."));
                let data = "";
                res.on("data", (chunk) => {
                    data += chunk;
                });
                log.debug(f("joke", `data: ${data}`));

                // Found joke! Send in channel
                log.debug(f("joke", "Found the joke"));
                res.on("end", () => {
                    let joke = JSON.parse(data);
                    log.debug(f("joke", `joke: ${joke}`));
                    if (joke != null) {
                        joke = joke.attachments[0].text;
                        log.debug(f("joke", "Processing joke"));
                        log.debug(f("joke", `joke: ${joke}`));
                        if (Math.floor(Math.random() * 2) == 0) {
                            joke += " :rofl:";
                        } else {
                            joke += " :joy:";
                        }
                    } else {
                        joke = "Sorry... we couldn't get you a joke :(";
                    }
                    log.debug(f("joke", "Sending joke..."));
                    log.debug(f("joke", `joke: ${joke}`));
                    message.channel.send(joke);
                });
            })
            .on("error", (error) => {
                message.channel.send("Sorry... we couldn't get you a joke :(");
                throw error;
            });
    },
};
