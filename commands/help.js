const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Provides a description for each command and how to use them',
    usage:
        `
        ${process.env.PREFIX}help
        ${process.env.PREFIX}help <command>...
        `,
    async execute(message, args) {

        // Setting up embed message to be sent
        const result = new Discord.MessageEmbed()
            .setTitle('Help!')
            .setDescription('Here is a description of the commands and how to use them');

        // Get the commands to help
        let commands = message.client.commands.keys();
        if (args.length != 0) {
            commands = args;
        }

        // Add fields to embedded
        let description;
        let usage;
        for (const command of commands) {
            if (message.client.commands.has(command)) {
                description = message.client.commands.get(command).description;
                usage = message.client.commands.get(command).usage;
            }
            else {
                description = 'Does not exist';
                usage = '';
            }
            const fieldTitle = `${process.env.PREFIX}${command}`;
            const fieldValue = `${description}${usage}`;
            result.addField(fieldTitle, fieldValue);
        }

        message.channel.send(result);

    },
};
