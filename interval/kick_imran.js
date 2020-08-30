"use strict";
module.exports = {
    name: 'Kick Imran',
    description: 'Ay! Cammm onnn dooooood...',
    execute(client) {
        const guildNameToKick = `Test Server 2`
        const usernameToKick = `BonkDev`;
        const channelName = `test-channel`

        // Find the proper guild
        let guildId = null;
        client.guilds.cache.forEach((guild) => {
            if (guild.name == guildNameToKick) {
                guildId = guild.id
            }
        });

        // Guild found checkpoint
        if (guildId == null) {
            console.error(`ERROR: Couldn't find the server/guild.`);
            return;
        };

        // Within guild, find the channel to send messages
        let channelId = null
        client.guilds.cache.get(guildId).channels.cache.forEach((channel) => {
            if (channel.name == channelName && channel.type == 'text' && !channel.deleted) {
                channelId = channel.id;
                // console.log(channelId);
            }
        });

        // Channel found checkpoint
        if (channelId == null) {
            console.error(`ERROR: Couldn't find the channel.`);
            return;
        }

        // Find the user to kick
        let userToKick = null;
        client.guilds.cache.get(guildId).members.fetch({force: true})
            .then((response) => {
                response.forEach((userobj) => {
                    if (userobj.user.username == usernameToKick) {
                        userToKick = userobj;
                        console.log(userToKick.user.username);
                    }
                });

                // User found checkpoint
                if (userToKick == null) {
                    console.error(`ERROR: Couldn't find the user.`);
                    return;
                }

                // Time to finally kick
                client.guilds.cache.get(guildId).channels.cache.get(channelId).send('Cya later buddy');
                userToKick.kick().then(console.log).catch(console.error);
            })
            .catch((error) => {
                console.error(error);
            });




    }
}
