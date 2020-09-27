const UsageError = require('../custom_errors/usage_error');

module.exports = {
    name: 'gif',
    description: 'We love GIFS!',
    async execute(message, args) {

        // Set up Giphy client
        require('dotenv').config();
        const gifToken = process.env.GIF_TOKEN;
        const GphApiClient = require('giphy-js-sdk-core');
        const gifClient = GphApiClient(gifToken);

        if (args.length == 0) {
            message.channel.send('You didn\'t search anything!');
            throw new UsageError('No search parameter defined');
        }

        const response = await gifClient.search('gifs', { 'q': args.join(' ') });
        if (response.pagination.count == 0) {
            message.channel.send('Sorry... we couldn\'t find you anything... :cry:');
            return;
        }
        const randomIndex = Math.floor(Math.random() * response.data.length);
        message.channel.send('Here is a gif! Have fun!', {
            files: [response.data[randomIndex].images.fixed_height.url],
        });

    },
};
