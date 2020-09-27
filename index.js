'use strict';
// Setup...
require('dotenv').config();
const prefix = process.env.PREFIX;
const token = process.env.TOKEN;
const Discord = require('discord.js');
const client = new Discord.Client();
const logger = require('./logger.js').logger;
const format = require('./logger.js').format;

const fs = require('fs');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

const intervalFiles = fs.readdirSync('./interval').filter(file => file.endsWith('.js'));
client.intervals = new Discord.Collection();
for (const file of intervalFiles) {
    const interval = require(`./interval/${file}`);
    client.intervals.set(interval.name, interval);
}
client.activeIntervals = new Discord.Collection();

// Logging in bot...
client.once('ready', () => {
    logger.info(format('client', 'Logging in...'));
});
client.login(token);
logger.info(format('client', 'Log in successful'));

// On a message sent...
client.on('message', message => {

    if ((message.content.startsWith(prefix) == false) || message.author.bot) {
        return;
    }
    const args = message.content.slice(prefix.length).split(/[ ]+/);
    const command = args.shift().toLowerCase();
    // message.channel.send(`Command: ${command}\nArgs: ${args}`);

    if (client.commands.has(command)) {

        logger.info(format(command, 'Command found'));
        client.commands.get(command).execute(message, args)
            .then((response) => {

                // Log information on success
                logger.info(format(command, 'Command executed'));
                if (response != null) {
                    console.log(response);
                }
            })
            .catch((error) => {

                // Catch the error and appropriate log it
                if (error.name == 'ExecutionError' || error.name == 'UsageError') {
                    logger.warn(format(command, `${error.name}: ${error.message}`));
                    logger.warn(format(command, 'Execution unsuccessful due to usage.'));
                }
                else {
                    logger.error(format(command, `${error.name}: ${error.message}`));
                    logger.error(format(command, 'Execution ran into unexpected errors.'));
                }
                message.channel.send('Sorry about that... :(');
            });
    }
    else {

        // Log warning when not found
        logger.warn(format(command, 'Command not found'));
        message.reply('I\'m sorry but I don\'t have that command :(');

    }

});
