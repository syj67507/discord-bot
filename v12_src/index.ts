import "dotenv/config";
import { Client, Collection } from "discord.js";
import { parseArgs, Command } from "./custom/base";
import { loadCommands } from "./custom/loadCommands";

const client = new Client();
const token = process.env.TOKEN;
const prefix = process.env.PREFIX || "!";

const commands = new Collection<string, Command>(); // Command definitions
const commandAliases = new Collection<string, string>(); // All aliases that map to a command definition
const commandGroups = new Collection<string, string[]>(); // Groups contain name of all commands

loadCommands(__dirname, commands, commandAliases, commandGroups);
console.log("Loaded");

client.once("ready", async () => {
    console.log(`Logged in ${client?.user?.id} as ${client?.user?.tag}`);
});

client.on("message", async (message) => {
    if (message.author.bot) {
        return;
    }
    if (!message.content.startsWith(prefix)) {
        return;
    }

    // Parse through message.content
    const rawArgs = message.content.toLowerCase().slice(prefix.length).split(/[ ]+/);
    const rawCommand = rawArgs.shift();

    // Find if the command is in the aliases
    if (rawCommand && commandAliases.has(rawCommand)) {
        // Retrieve command definition and run
        const commandAlias = commandAliases.get(rawCommand)!;
        const command = commands.get(commandAlias)!;
        const args = parseArgs(rawArgs, command.arguments);
        await command.run(message, args);
    } else {
        message.reply(`Unknown command \`${prefix}${rawCommand}\` not found.`);
    }
});

client.login(token);
