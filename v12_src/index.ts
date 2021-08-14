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

client.once("ready", () => {
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

    // If the command is not found in the aliases
    if (!(rawCommand && commandAliases.has(rawCommand))) {
        message.reply(`Unknown command \`${prefix}${rawCommand}\` not found.`);
        return;
    }

    // Retrieve command definition
    const commandAlias = commandAliases.get(rawCommand)!;
    const command = commands.get(commandAlias)!;

    // Attempt to parse args and run the command
    try {
        const args = parseArgs(rawArgs, command.arguments);
        await command.run(message, args);
    } catch (error) {
        if (error.name === "ArgumentUsageError") {
            message.channel.send([
                `${message.author}`,
                `\`Invalid command usage: double check your arguments/parameters.\``,
                `\`${error.message}\``,
            ]);
        } else {
            message.reply([
                `An error occurred while running the command: \`${error.message}\``,
                `You shouldn't ever receive an error like this.`,
                `Please contact the bot admin.`,
            ]);
        }
        process.stderr.write("CommandExecutionError: ");
        console.error(error);
    }
});

client.login(token);
