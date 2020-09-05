"use strict";
module.exports = {
    name: 'Kill Interval',
    description: 'Ay! Cammm onnn dooooood...',
    execute(client, args) {
        const guildNameToKick = `Test Server 2`
        const usernameToKick = args;
        const channelName = `test-channel`

        // Find the proper guild
        let guildId = null;
        client.guilds.cache.forEach((guild) => {
            if (guild.name == guildNameToKick) {
                guildId = guild.id;
                console.log(`${new Date().toISOString()}: Found the guildId: ${guildId}`);
            }
        });

        // Guild found checkpoint
        if (guildId == null) {
            console.error(`${new Date().toISOString()}: ERROR: Couldn't find the server/guild.`);
            return;
        };

        // Within guild, find the channel to send messages
        let channelId = null
        client.guilds.cache.get(guildId).channels.cache.forEach((channel) => {
            if (channel.name == channelName && channel.type == 'text' && !channel.deleted) {
                channelId = channel.id;
                console.log(`${new Date().toISOString()}: Found the channelId: ${channelId}`);
            }
        });

        // Channel found checkpoint
        if (channelId == null) {
            console.error(`${new Date().toISOString()}: ERROR: Couldn't find the channel.`);
            return;
        }

        // Find the user to kick
        client.guilds.cache.get(guildId).members.fetch({force: true})
            .then((members) => {
                let userToKick = null;
                members.forEach((userobj) => {
                    if (userobj.user.username == usernameToKick) {
                        userToKick = userobj;
                        console.log(`${new Date().toISOString()}: Found user to kick: ${userToKick.user.username}`);
                    }
                });
                return userToKick;
            })
            .then((userToKick) => {
                return userToKick.kick();
            })
            .then((kicked) => {
                client.guilds.cache.get(guildId).channels.cache.get(channelId).send('Cya later buddy');
                console.log(`${new Date().toISOString()}: Kicked message sent to channel.`);
                console.log(`${new Date().toISOString()}: ${kicked.user.username} was kicked.`);
            })
            .catch((error) => {
                console.error(`${new Date().toISOString()}: ${error}`);
            });




    }
}
