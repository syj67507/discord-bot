'use strict';
// Setup...
require('dotenv').config();
const prefix = process.env.PREFIX;
const token = process.env.TOKEN;
const Discord = require('discord.js');
const client = new Discord.Client();
const logger = require('./logger.js');

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
    logger.info('CLIENT: Logging in...');
});
client.login(token);
logger.info('CLIENT: Log in successful');

// On a message sent...
client.on('message', message => {

    if ((message.content.startsWith(prefix) == false) || message.author.bot) {
        return;
    }
    const args = message.content.slice(prefix.length).split(/[ ]+/);
    const command = args.shift().toLowerCase();
    // message.channel.send(`Command: ${command}\nArgs: ${args}`);

    if (client.commands.has(command)) {
        logger.info(`COMMAND ${command.toUpperCase()}: command found`);
        client.commands.get(command).execute(message, args)
            .then((response) => {
                logger.info(`COMMAND ${command.toUpperCase()}: command executed`);
                if (response != null) {
                    console.log(response);
                }
            })
            .catch((error) => {
                logger.error(`COMMAND ${command.toUpperCase()}: ${error.name}: ${error.message}`);
                logger.error(`COMMAND ${command.toUpperCase()}: execution unsuccessful`);
                message.channel.send('Sorry about that... :(');
            });
    }
    else {
        logger.warn(`COMMAND ${command.toUpperCase}: not found`);
        message.reply('I\'m sorry but I don\'t have that command :(');
    }

});
