"use strict";
module.exports = {
    name: 'kill',
    description: 'Ay! Cammm onnn dooooood...',
    execute(message, args) {
        const client = message.client; // used for interval management

        // validates user to be killed
        if (args.length != 2 ) {
            message.channel.send([
                'UsageError: kill <@> <seconds>',
                '10 seconds is the lowest you can set for <seconds>'
            ]);
            return;
        }
        if (args[1] < 10) {
            args[1] = 10
        }
        if (message.mentions.members.size == 0) {
            message.channel.send(`I can't find ${args[0]}, maybe he's already dead...`);
            return;
        }
        if (client.activeIntervals.has(args[0])) {
            message.channel.send(`I'm already killing ${args[0]}, give me time to prepare...`);
            return;
        }

        // finds user to kill and sets up reiterating interval
        message.channel.send(`Mr. Zurkon is here to kill: ${args[0]} :dagger:`);
        message.mentions.members.first().fetch()
            .then((guildMember) => {
                const interval = client.setInterval(
                    client.intervals.get('Kill Interval').execute,
                    1000*args[1], // time
                    message,
                    args[0], // mention used for error handling
                    client
                );
                console.log(args);
                client.activeIntervals.set(args[0], interval);
                console.log(client.activeIntervals);
            })
            .catch((error) => {
                message.channel.send(`Error: ${error}`);
            });
    }
}
