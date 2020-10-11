const ExecutionError = require('../custom_errors/execution_error');
const UsageError = require('../custom_errors/usage_error');
const { logger, format } = require('../logger');

// Validates the incoming arguments
// Returns a collection of the guildMembers
function validate(message, args) {

    let time = 10;

    // check if args are not empty
    if (args.length < 1) {
        throw new UsageError('Did not mention anybody');
    }

    // pull the last argument and check if its a number and set the time
    const userTime = parseInt(args[args.length - 1]);
    if (!isNaN((userTime)) && (time < userTime)) {
        time = userTime;
    }

    // check if there are user mentioned
    if (message.mentions.members.size < 0) {
        throw new UsageError('Did not mention anybody');
    }

    return {
        time: time,
        mentions: message.mentions.members,
    };

}

// Sets the interval to kill for each member
function initIntervals(mentions, activeIntervals) {
    for (const mention of mentions.keys()) {
        const guildMember = mentions.get(mention);
        console.log('Setting interval: ', guildMember.user.username);
        activeIntervals.set(mention, 'a');
    }
}

module.exports = {
    name: 'kill',
    description: 'Kicks a member from voice chat every set number of seconds',
    usage:
        `
        ${process.env.PREFIX}kill <@userMention> <seconds>
        `,
    async execute(message, args) {
        const v = validate(message, args);
        initIntervals(v.mentions, message.client.activeIntervals);
        console.log(message.client.activeIntervals, v.time);
        // // used for interval management
        // const client = message.client;

        // // validates user to be killed
        // logger.debug(format('kill', 'kill.js - Validating arguments'));
        // if (args.length != 2) {
        //     message.channel.send([
        //         'UsageError: kill <@> <seconds>',
        //         '60 seconds is the lowest you can set for <seconds>',
        //     ]);
        //     throw new UsageError('<seconds> argument not defined');
        // }
        // if (args[1] < 60) {
        //     logger.warn(format('kill', 'kill.js - Amount of time is too small, setting to default'));
        //     args[1] = 60;
        // }
        // if (message.mentions.members.size == 0) {
        //     message.channel.send(`I can't find ${args[0]}, maybe he's already dead...`);
        //     throw new ExecutionError('Unable to find the user within the guild');
        // }
        // if (client.activeIntervals.has(args[0])) {
        //     message.channel.send(`I'm already killing ${args[0]}, give me time to prepare...`);
        //     throw new UsageError('User already specified. User must be revived.');
        // }
        // logger.debug(format('kill', 'kill.js - Argument validated.'));

        // // finds user to kill and sets up reiterating interval
        // logger.debug(format('kill', 'kill.js - Initiating...'));
        // await message.channel.send(`Imran Rahman is coming to kill you dood... ${args[0]} :dagger:`);
        // const guildMember = await message.mentions.members.first().fetch();
        // if (`<@!${guildMember.user.id}>` != args[0]) {
        //     throw new ExecutionError('Fetching guild member does not match user mention');
        // }
        // logger.debug(format('kill', 'kill.js - Verified mentioned user'));
        // logger.debug(format('kill.js', `Mentioned User Id: ${guildMember.user.id}`));
        // logger.debug(format('kill', 'kill.js - Setting interval'));
        // const interval = client.setInterval(
        //     client.intervals.get('Kill Interval').execute,
        //     1000 * args[1], // time
        //     message,
        //     args[0], // mention used for error handling
        //     client,
        // );
        // client.activeIntervals.set(args[0], interval);
        // logger.debug(format('kill.js', `Added to intervals: ${client.activeIntervals}`));

    },
};
