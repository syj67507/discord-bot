const logger = require('../logger.js').logger;
const format = require('../logger.js').format;

module.exports = {
    name: 'joke',
    description: 'Sends a dad joke!',
    usage: `
    ${process.env.PREFIX}joke
    `,
    async execute(message, args) {

        logger.debug(format('joke', 'Making a request...'));
        const https = require('https');
        https.get('https://icanhazdadjoke.com/slack', (res) => {
            // Receiving joke
            logger.debug(format('joke', 'Loading joke...'));
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            logger.debug(format('joke', `data: ${data}`));

            // Found joke! Send in channel
            logger.debug(format('joke', 'Found the joke'));
            res.on('end', () => {
                let joke = JSON.parse(data);
                logger.debug(format('joke', `joke: ${joke}`));
                if (joke != null) {
                    joke = joke.attachments[0].text;
                    logger.debug(format('joke', 'Processing joke'));
                    logger.debug(format('joke', `joke: ${joke}`));
                    if (Math.floor(Math.random() * 2) == 0) {
                        joke += ' :rofl:';
                    }
                    else {
                        joke += ' :joy:';
                    }
                }
                else {
                    joke = 'Sorry... we couldn\'t get you a joke :(';
                }
                logger.debug(format('joke', 'Sending joke...'));
                logger.debug(format('joke', `joke: ${joke}`));
                message.channel.send(joke);
            });
        }).on('error', (error) => {
            message.channel.send('Sorry... we couldn\'t get you a joke :(');
            throw error;
        });
    },
};
