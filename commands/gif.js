const logger = require('../logger.js').logger;
const format = require('../logger.js').format;
const ExecutionError = require('../custom_errors/execution_error');
const UsageError = require('../custom_errors/usage_error');

module.exports = {
    name: 'gif',
    description: 'Gives back a gif based on your search term',
    usage: `
    ${process.env.PREFIX}gif <search term>
    `,
    async execute(message, args) {

        // Set up Giphy client
        require('dotenv').config();
        const gifToken = process.env.GIF_TOKEN;
        const GphApiClient = require('giphy-js-sdk-core');
        const gifClient = GphApiClient(gifToken);
        logger.debug(format('gif', 'Created Giphy Client'));


        if (args.length == 0) {
            message.channel.send('You didn\'t search anything!');
            throw new UsageError('No search arguments provided');
        }

        logger.debug(format('gif', `Searching for: ${args.join(' ')}`));
        const response = await gifClient.search('gifs', { 'q': args.join(' ') });
        logger.debug(format('gif', `Response: ${response}`));
        if (response.pagination.count == 0) {
            message.channel.send('We couldn\'t find you anything... :cry:');
            throw new ExecutionError('Giphy client return no results');
        }
        const randomIndex = Math.floor(Math.random() * response.data.length);
        logger.debug(format('gif', 'Sending image to channel...'));
        logger.debug(format('gif', response.data[randomIndex].images.fixed_height.url));
        message.channel.send('Here is a gif! Have fun!', {
            files: [response.data[randomIndex].images.fixed_height.url],
        });
        logger.debug('Image retrieved from API and sent to channel.');

    },
};
