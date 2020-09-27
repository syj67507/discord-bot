module.exports = {
    name: 'Kill Interval',
    description: 'Ay! Cammm onnn dooooood...',
    execute(message, memberId, client) {
        // Fetch the user to kill
        message.mentions.members.first().fetch()
            .then((guildMember) => {
                message.channel.send('You are not welcome here.');
                return guildMember.kick();
            })
            .then((kickedGM) => {
                message.channel.send(`${memberId} has been killed!`);
            })
            .catch((error) => {
                // Can't kill due to permissions
                console.log(`Error: ${error}`);
                const MISSING_PERMISSIONS = 50013;
                if (error.code == MISSING_PERMISSIONS) {
                    console.log('Removing from intervals');
                    const interval = client.activeIntervals.get(memberId);
                    client.activeIntervals.delete(memberId);
                    client.clearInterval(interval);
                }
            });
    },
};
