const UsageError = require('../custom_errors/usage_error');
const { logger, format } = require('../logger');

module.exports = {
    name: 'kill',
    description: 'Kicks a member from voice chat every set number of seconds',
    usage:
        `
        ${process.env.PREFIX}kill <@userMention> <seconds>
        `,
    async execute(message, args) {

        const input = processInput(message, args);
        initIntervals(message, input.mentions, input.time);

    },
};

/**
 * Processes the incoming message that initiated the command.
 *
 * @param {Discord.Message} message The incoming message.
 * @param {Array}           args    The arguments of the command.
 *
 * @returns {number}                The amount of time in milliseconds.
 * @returns {Discord.Collection}    Members mentioned in the incoming message.
 */
function processInput(message, args) {

    // There must be at least one argument
    if (args.length < 1) {
        throw new UsageError('Did not mention anybody');
    }

    // Mentions must be specified
    if (message.mentions.members.size < 0) {
        throw new UsageError('Did not mention anybody');
    }

    // Pulling time if specified
    let time = 10;
    const userTime = parseInt(args[args.length - 1]);
    if (!isNaN((userTime)) && (time < userTime)) {
        time = userTime;
    }

    return {
        time: time * 1000,
        mentions: message.mentions.members,
    };

}

/**
 * Sets the interval to kill for each member on the client.
 *
 * @param {Discord.Message}     message     The incoming message.
 * @param {Discord.Collection}  mentions    The user mentions to kill.
 * @param {number}              time        The time in millseconds for how often to kill.
 */
function initIntervals(message, mentions, time) {
    for (const mention of mentions.keys()) {
        const guildMember = mentions.get(mention);
        const interval = message.client.setInterval(kick, time, guildMember);
        message.client.activeIntervals.set(mention, interval);
    }
}

/**
 * Kicks a user from voice chat.
 *
 * @param {Discord.GuildMember} guildMember The user/guild member to kick.
 */
function kick(guildMember) {
    guildMember.fetch()
        .then((res) => {
            return res.voice.setChannel(null);
        })
        .then(() => {
            console.log('kicked');
        })
        .catch((err) => {
            console.log(err);
        });
}
