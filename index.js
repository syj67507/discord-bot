'use strict';
// Setup...
require('dotenv').config();
const prefix = process.env.PREFIX;
const token = process.env.TOKEN;
const Discord = require('discord.js');
const client = new Discord.Client();

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
    console.log('Ready!');
});
client.login(token);

// On a message sent...
client.on('message', message => {

    if ((message.content.startsWith(prefix) == false) || message.author.bot) {
        return;
    }
    const args = message.content.slice(prefix.length).split(/[ ]+/);
    const command = args.shift().toLowerCase();
    // message.channel.send(`Command: ${command}\nArgs: ${args}`);

    if (client.commands.has(command)) {
        try {
            client.commands.get(command).execute(message, args)
                .then((r) => {
                    console.log('success' + r);
                })
                .catch(() => {
                    console.log('error');
                });
        }
        catch (error) {
            // console.log(error);
            console.log('there was an error in running');
            message.channel.send('I\'m sorry but I am having issues running that command :(');
        }
    }
    else {
        message.reply('I\'m sorry but I don\'t have that command :(');
    }

});
