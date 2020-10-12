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
        time: time * 1000,
        mentions: message.mentions.members,
    };

}

// Sets the interval to kill for each member
function initIntervals(mentions, time, client) {
    for (const mention of mentions.keys()) {
        const guildMember = mentions.get(mention);
        console.log('Setting interval: ', guildMember.user.username);
        const interval = client.setInterval(kick, time, guildMember);
        client.activeIntervals.set(mention, interval);
    }
}

// Kicks the given user/guild member from voice chat
// Warning: will not work on users/guild members with higher permission
function kick(guildMember) {
    console.log('inside kick()');
    guildMember.fetch()
        .then((res) => {
            return res.voice.setChannel(null);
        })
        .then((res) => {
            console.log('kicked');
        })
        .catch((err) => {
            console.log(err);
        });
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
        initIntervals(v.mentions, v.time, message.client);

    },
};
