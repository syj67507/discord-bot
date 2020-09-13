module.exports = {
    name: 'gif',
    description: 'We love GIFS!',
    execute(message, args) {
        require('dotenv').config();
        const gifToken = process.env.GIF_TOKEN;
        const GphApiClient = require('giphy-js-sdk-core');
        const gifClient = GphApiClient(gifToken);

        if (args.length == 0) {
            return message.channel.send('You didn\'t search anything!');
        }
        gifClient.search('gifs', {"q": args.join(' ')})
            .then((response) => {
                if (response.pagination.count == 0) {
                    return message.channel.send('Sorry... we couldn\'t find you anything... :cry:');
                }
                let randomIndex = Math.floor(Math.random() * response.data.length);
                message.channel.send('Here is a gif! Have fun!', {
                    files: [response.data[randomIndex].images.fixed_height.url]
                });
            });
    }
}
