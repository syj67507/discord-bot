module.exports = {
    name: 'ultra',
    description: 'PLUS ULTRA PROMINENCE BURN',
    async execute(message, args) {

        const ytdl = require('ytdl-core');

        // Validation checks
        if (message.member.voice.channel == null) {
            message.channel.send('You must join a voice channel.');
            return;
        }

        // Let the bot join the channel
        const channel = message.member.voice.channel;
        const connection = await channel.join();

        // Start yelling on successful join
        console.log('Joined the channel');
        const dispatcher = connection.play(ytdl('https://www.youtube.com/watch?v=vaGzR9E9mPU'));

        // Use dispatcher to identify the end of the clip
        dispatcher.on('speaking', (speaking) => {
            if (!speaking) {
                channel.leave();
            }
        });
    },
};
