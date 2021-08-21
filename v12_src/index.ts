import "dotenv/config";
import { Client, Collection } from "discord.js";
import { parseArgs, Command } from "./custom/base";
import { loadCommands } from "./custom/loadCommands";

const client = new Client();
const token = process.env.TOKEN;
const prefix = process.env.PREFIX!;

export const { commands, commandAliases, commandGroups } = loadCommands(__dirname);
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

    // If command is disabled stop here
    // If the command is a utility command, then you can not disable it
    ///// This can be handled inside of the utility commands run() definition
    ///// Or the disable property can be [enable, disable, fixed]
    ///// Could have a different command definition for utilty commands that
    ///// does not have a disable property, so the enable/disable only allows
    ///// for changes on those that have that property (non-utility commands)

    // Attempt to parse args and run the command
    try {
        const args = await parseArgs(rawArgs, command.arguments, message.guild!);
        await command.run(message, args);
    } catch (error) {
        if (error.name === "ArgumentUsageError") {
            message.reply(["`Invalid command usage`", `\`${error.message}\``]);
        } else if (error.name === "ArgumentCustomValidationError") {
            message.reply([
                "`Invalid command usage: Did not pass the requirements.`",
                "`Check the help command for more information.`",
                `\`${error.message}\``,
            ]);
        } else {
            message.reply([
                `An error occurred while running the command: \`${error.message}\``,
                "You shouldn't ever receive an error like this.",
                "Please contact the bot admin.",
            ]);
        }
        process.stderr.write("CommandExecutionError: ");
        console.error(error);
    }
});

client.login(token);

export { client };
