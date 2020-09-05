"use strict";
module.exports = {
    name: 'kill',
    description: 'Ay! Cammm onnn dooooood...',
    execute(message, args) {
        if (args.length != 1) {
            console.log('UsageError: kill expects exactly 1 argument.');
            return;
        }
        console.log(`Killing ${args[0]}...`);

        const client = message.client;
        if (client.activeIntervals.has(args[0])) {
            console.log(`${args[0]} is already being killed!`);
            return;
        }
        const interval = client.setInterval(
            client.intervals.get('Kill Interval').execute,
            3000,
            client,
            args[0] // holds the user to kick
        );
        client.activeIntervals.set(args[0], interval);
        console.log(client.activeIntervals);
    }
}
