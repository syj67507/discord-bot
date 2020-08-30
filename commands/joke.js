module.exports = {
    name: 'joke',
    description: 'Jokes!',
    execute(message, args) {
        const https = require('https');
        https.get('https://icanhazdadjoke.com/slack', (res) => {
            // Receiving joke
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            // Found joke! Send in channel
            res.on('end', () => {
                let joke = JSON.parse(data);
                if (joke != null) {
                    joke = joke.attachments[0].text;
                    if (Math.floor(Math.random() * 2) == 0) {
                        joke += ' :rofl:'
                    }
                    else {
                        joke += ' :joy:'
                    }
                }
                else {
                    joke = 'Sorry... we couldn\'t get you a joke :(';
                }
                message.channel.send(joke);
            });
        }).on('error', (error) => {
            message.channel.send('Sorry... we couldn\'t get you a joke :(');
        })
    }
}
