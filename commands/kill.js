const UsageError = require('../custom_errors/usage_error');

module.exports = {
    name: 'kill',
    description: 'Ay! Cammm onnn dooooood...',
    async execute(message, args) {

        // used for interval management
        const client = message.client;

        // validates user to be killed
        if (args.length != 2) {
            message.channel.send([
                'UsageError: kill <@> <seconds>',
                '60 seconds is the lowest you can set for <seconds>',
            ]);
            throw new UsageError('<seconds> argument not defined');
        }
        if (args[1] < 60) {
            args[1] = 60;
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
        await message.channel.send(`Mr. Zurkon is here to kill: ${args[0]} :dagger:`);
        const guildMember = await message.mentions.members.first().fetch();
        if (`<@!${guildMember.user.id}>` != args[0]) {
            throw ReferenceError('Fetching guild member does not match user mention');
        }
        const interval = client.setInterval(
            client.intervals.get('Kill Interval').execute,
            1000 * args[1], // time
            message,
            args[0], // mention used for error handling
            client,
        );
        console.log(args);
        client.activeIntervals.set(args[0], interval);
        console.log(client.activeIntervals);

    },
};
