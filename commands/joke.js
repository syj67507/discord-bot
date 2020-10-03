const logger = require('../logger.js').logger;
const format = require('../logger.js').format;

module.exports = {
    name: 'joke',
    description: 'Jokes!',
    async execute(message, args) {

        logger.info(format('joke', 'Making a request...'));
        const https = require('https');
        https.get('https://icanhazdadjoke.com/slack', (res) => {
            // Receiving joke
            logger.info(format('joke', 'Loading joke...'));
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            logger.debug(format('joke', `data: ${data}`));

            // Found joke! Send in channel
            logger.info(format('joke', 'Found the joke'));
            res.on('end', () => {
                let joke = JSON.parse(data);
                logger.debug(format('joke', `joke: ${joke}`));
                if (joke != null) {
                    joke = joke.attachments[0].text;
                    logger.info(format('joke', 'Processing joke'));
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
                logger.info(format('joke', 'Sending joke...'));
                logger.debug(format('joke', `joke: ${joke}`));
                message.channel.send(joke);
            });
        }).on('error', (error) => {
            message.channel.send('Sorry... we couldn\'t get you a joke :(');
            throw error;
        });
    },
};
