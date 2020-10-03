const { logger, format } = require('../logger');

module.exports = {
    name: 'Kill Interval',
    description: 'Ay! Cammm onnn dooooood...',
    execute(message, memberId, client) {
        // Fetch the user to kill
        logger.debug(format('kill', `kill_interval.js - Fetching user ${memberId}`));
        message.mentions.members.first().fetch()
            .then((guildMember) => {
                message.channel.send('You are not welcome here.');
                logger.debug(format('kill', `kill_interval.js - Kicking user ${memberId}`));
                return guildMember.kick();
            })
            .then((kickedGM) => {
                message.channel.send(`${memberId} has been killed!`);
                logger.debug(format('kill', `kill_interval.js - Kicked user ${memberId}`));
            })
            .catch((error) => {
                // Can't kill due to permissions
                logger.error(format('kill', `kill_interval.js - Error: ${error}`));
                const MISSING_PERMISSIONS = 50013;
                if (error.code == MISSING_PERMISSIONS) {
                    logger.debug(format('kill', `kill_interval.js - Removing from intervals ${memberId}`));
                    const interval = client.activeIntervals.get(memberId);
                    logger.debug(format('kill', `kill_interval.js - Interval to remove ${interval}`));
                    client.activeIntervals.delete(memberId);
                    client.clearInterval(interval);
                    logger.debug(format(
                        'kill',
                        `kill_interval.js - Removed - activeIntervals: ${client.activeIntervals}`,
                    ));
                }
            });
    },
};
