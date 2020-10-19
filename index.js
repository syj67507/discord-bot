"use strict";
// Setup...
require("dotenv").config();
const prefix = process.env.PREFIX;
const token = process.env.TOKEN;
const Discord = require("discord.js");
const client = new Discord.Client();
const log = require("./custom/logger").logger;
const f = require("./custom/logger").format;

const fs = require("fs");
client.commands = new Discord.Collection();
const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.activeIntervals = new Discord.Collection();

// Logging in bot...
client.once("ready", () => {
    log.info(f("client", "Log in successful"));
});
client.login(token);

// On a message sent...
client.on("message", (message) => {
    if (message.content.startsWith(prefix) == false || message.author.bot) {
        return;
    }
    const args = message.content.slice(prefix.length).split(/[ ]+/);
    const command = args.shift().toLowerCase();

    // logging
    log.debug(f("client", `Command: ${command}`));
    log.debug(f("client", `Args: ${args}`));

    if (client.commands.has(command)) {
        log.info(f(command, "Command found"));
        client.commands
            .get(command)
            .execute(message, args)
            .then((response) => {
                // Log information on success
                log.info(f(command, "Command executed"));
                if (response != null) {
                    console.log(response);
                }
            })
            .catch((error) => {
                // Catch the error and appropriate log it
                if (
                    error.name == "ExecutionError" ||
                    error.name == "UsageError"
                ) {
                    log.error(f(command, `${error.name}: ${error.message}`));
                    log.error(
                        f(command, "Execution unsuccessful due to usage.")
                    );
                } else {
                    log.error(f(command, `${error.name}: ${error.message}`));
                    log.error(
                        f(command, "Execution ran into unexpected errors.")
                    );
                }
                message.channel.send("Sorry about that... :(");
            });
    } else {
        // Log warning when not found
        log.warn(f(command, "Command not found"));
        message.reply("I'm sorry but I don't have that command :(");
    }
});
