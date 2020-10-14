const UsageError = require('../custom_errors/usage_error');
const { logger, format } = require('../logger');

module.exports = {
    name: 'kill',
    description: 'Kicks a member from voice chat every set number of seconds',
    usage:
        `
        ${process.env.PREFIX}kill <@user> <seconds>
        Note: <seconds> cannot be less than 10
        `,
    async execute(message, args) {

        const input = processInput(message, args);
        logger.debug(format('kill', `Time: ${input.time}`));
        logger.debug(format('kill', `Mentions: ${input.mentions}`));
        message.channel.send(
            'Hunting...'
        );

        initIntervals(message, input.mentions, input.time);
        logger.debug(format('kill', `Active Intervals: ${message.client.activeIntervals}`));

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
    if (message.mentions.members.size < 1) {
        throw new UsageError('Did not mention anybody');
    }

    // Pulling time if specified
    let time = 10;
    const userTime = parseInt(args[args.length - 1]);
    if (!isNaN((userTime)) && (time <= userTime)) {
        time = userTime;
    }
    else {
        logger.debug(format('kill', `Specified time not specified/invalid, defaulting to ${time}`));
    }

    return {
        time: time * 1000,
        mentions: message.mentions.members,
    };

}

/**
 * Sets the interval to kill for each member on the client.
 *
 * @param   {Discord.Message}     message     The incoming message.
 * @param   {Discord.Collection}  mentions    The user mentions to kill.
 * @param   {number}              time        The time in millseconds for how often to kill.
 */
function initIntervals(message, mentions, time) {
    for (const mention of mentions.keys()) {

        const guildMember = mentions.get(mention);
        logger.debug(format('kill', `GuildMember ID: ${guildMember.user.id}`));

        if (message.client.activeIntervals.has(guildMember.user.id)) {
            message.channel.send(`<@${guildMember.user.id}> is already on the list.`);
        }
        else {
            const interval = message.client.setInterval(kick, time, guildMember, message);
            message.client.activeIntervals.set(guildMember.user.id, interval);
        }

    }
}

/**
 * Kicks a user from voice chat.
 *
 * @param {Discord.GuildMember} guildMember The user/guild member to kick.
 * @param {Discord.Message}     message     The incoming message.
 */
function kick(guildMember, message) {

    let previousChannel;

    guildMember.fetch()
        .then((res) => {
            previousChannel = res.voice.channel;
            return res.voice.setChannel(null);
        })
        .then((res) => {
            if (previousChannel !== null) {
                logger.debug(format('kill', `GuildMember ID kicked: ${res.user.id}`));
                message.channel.send('I have brain damage.');
            }
        })
        .catch((err) => {
            logger.error(format('killerr', err));
            logger.debug(format('kill', `Removing interval on ${guildMember.user.id}`));
            message.channel.send(
                `I'm having trouble killing <@${guildMember.user.id}>, removing him from the list`
            );

            const interval = message.client.activeIntervals.get(guildMember.user.id);
            message.client.clearInterval(interval);
            message.client.activeIntervals.delete(guildMember.user.id);

            logger.debug(format('kill', `Active Intervals: ${message.client.activeIntervals.keyArray()}`));
        });

}
