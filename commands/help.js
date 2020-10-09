const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Need more intel...',
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
        for (const command of commands) {
            if (message.client.commands.has(command)) {
                description = message.client.commands.get(command).description;
            }
            else {
                description = 'Does not exist';
            }
            const fieldTitle = `${process.env.PREFIX}${command}`;
            const fieldValue = description;
            result.addField(fieldTitle, fieldValue);
        }

        message.channel.send(result);

    },
};