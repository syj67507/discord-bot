"use strict";
module.exports = {
    name: 'revive',
    description: 'Ay! Cammm onnn dooooood... back in the game!!',
    execute(message, args) {
        if (args.length != 1) {
            console.log('UsageError: revive expects exactly 1 argument.');
            return;
        }
        console.log('Reviving inside commands...');

        const client = message.client;
        if (!client.activeIntervals.has(args[0])) {
            console.log(`Can't revive a member who isn't being killed.`);
            return;
        }
        const interval = client.activeIntervals.get(args[0]);
        client.activeIntervals.delete(args[0]);
        client.clearInterval(interval);
        console.log(client.activeIntervals);
    }
}
