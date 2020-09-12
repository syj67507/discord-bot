module.exports = {
    name: 'prominence-burn',
    description: 'Prominence Burn!!!',
    execute(message, args) {
        const ytdl = require('ytdl-core');

        // Validation checks
        if (message.member.voice.channel == null) {
            message.channel.send('You must join a voice channel.');
            return;
        }

        // Let the bot join the channel
        message.member.voice.channel.join()
            .then((connection) => {
                // Start yelling on successful join
                console.log('Joined the channel');
                const dispatcher = connection.play(ytdl('https://www.youtube.com/watch?v=vaGzR9E9mPU'));

                // Use dispatcher to identify the end of the clip
                dispatcher.on('speaking', (speaking) => {
                    if (!speaking) {
                        message.member.voice.channel.leave();
                    }
                });
            });
        // catching errors will be handled in index.js

    },
};
