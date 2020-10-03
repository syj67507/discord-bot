const UsageError = require('../custom_errors/usage_error.js');
const { logger, format } = require('../logger.js');

module.exports = {
    name: 'ultra',
    description: 'PLUS ULTRA PROMINENCE BURN',
    async execute(message, args) {

        const ytdl = require('ytdl-core');

        // Validation checks
        logger.info(format('ultra', 'Validating...'));
        if (message.member.voice.channel == null) {
            message.channel.send('You must join a voice channel.');
            throw new UsageError('Client cannot join a null value voice channel');
        }
        logger.info(format('ultra', 'Validated'));

        // Let the bot join the channel
        logger.info(format('ultra', 'Joining channel'));
        const channel = message.member.voice.channel;
        const connection = await channel.join();
        logger.info(format('ultra', 'Joined channel'));
        logger.debug(format('ultra', `Joined channel: ${channel.name}`));

        // Start yelling on successful join
        logger.info(format('ultra', 'Playing clip'));
        const dispatcher = connection.play(ytdl('https://www.youtube.com/watch?v=vaGzR9E9mPU'));

        // Use dispatcher to identify the end of the clip
        dispatcher.on('speaking', (speaking) => {
            if (!speaking) {
                logger.info(format('ultra', 'Leaving channel...'));
                channel.leave();
                logger.info(format('ultra', 'Left the channel'));
            }
        });
    },
};
