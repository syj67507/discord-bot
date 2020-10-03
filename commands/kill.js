const ExecutionError = require('../custom_errors/execution_error');
const UsageError = require('../custom_errors/usage_error');
const { logger, format } = require('../logger');

module.exports = {
    name: 'kill',
    description: 'Ay! Cammm onnn dooooood...',
    async execute(message, args) {

        // used for interval management
        const client = message.client;

        // validates user to be killed
        logger.info(format('kill', 'kill.js - Validating arguments'));
        if (args.length != 2) {
            message.channel.send([
                'UsageError: kill <@> <seconds>',
                '60 seconds is the lowest you can set for <seconds>',
            ]);
            throw new UsageError('<seconds> argument not defined');
        }
        if (args[1] < 60) {
            logger.warn(format('kill', 'kill.js - Amount of time is too small, setting to default'));
            args[1] = 60;
        }
        if (message.mentions.members.size == 0) {
            message.channel.send(`I can't find ${args[0]}, maybe he's already dead...`);
            throw new ExecutionError('Unable to find the user within the guild');
        }
        if (client.activeIntervals.has(args[0])) {
            message.channel.send(`I'm already killing ${args[0]}, give me time to prepare...`);
            throw new UsageError('User already specified. User must be revived.');
        }
        logger.info(format('kill', 'kill.js - Argument validated.'));

        // finds user to kill and sets up reiterating interval
        logger.info(format('kill', 'kill.js - Initiating...'));
        await message.channel.send(`Mr. Zurkon is here to kill: ${args[0]} :dagger:`);
        const guildMember = await message.mentions.members.first().fetch();
        if (`<@!${guildMember.user.id}>` != args[0]) {
            throw new ExecutionError('Fetching guild member does not match user mention');
        }
        logger.info(format('kill', 'kill.js - Verified mentioned user'));
        logger.debug(format('kill.js', `Mentioned User Id: ${guildMember.user.id}`));
        logger.info(format('kill', 'kill.js - Setting interval'));
        const interval = client.setInterval(
            client.intervals.get('Kill Interval').execute,
            1000 * args[1], // time
            message,
            args[0], // mention used for error handling
            client,
        );
        client.activeIntervals.set(args[0], interval);
        logger.debug(format('kill.js', `Added to intervals: ${client.activeIntervals}`));

    },
};
