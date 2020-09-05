"use strict";
module.exports = {
    name: 'revive',
    description: 'Ay! Cammm onnn dooooood... back in the game!!',
    execute(message, args) {
        if (args.length != 1) {
            console.log('UsageError: revive expects exactly 1 argument.');
            return;
        }
        console.log('Reviving, removing from intervals...');

        const client = message.client;
        if (!client.activeIntervals.has(args[0])) {
            message.channel.send(`Can't revive a member who isn't being killed.`);
            return;
        }
        const interval = client.activeIntervals.get(args[0]);
        client.activeIntervals.delete(args[0]);
        client.clearInterval(interval);
        console.log('Removed interval.');
        console.log(client.activeIntervals);
    }
}