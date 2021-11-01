import "dotenv/config";
import { Client } from "discord.js";
import { parseArgs } from "./custom/base";
import { loadCommands } from "./custom/loadCommands";
import { ArgumentUsageError } from "./errors/ArgumentUsageError";
import { ArgumentCustomValidationError } from "./errors/ArgumentCustomValidationError";
import registerGCP from "./custom/register-gcp";
import { logger as log, format as f } from "./custom/logger";

const client = new Client();
const token = process.env.TOKEN;
const prefix = process.env.PREFIX!;

log.debug(f("main", "Loading commands..."));
export const { commands, commandAliases, commandGroups } = loadCommands(__dirname);
log.debug(f("main", "Commands loaded."));

registerGCP();

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
    if (!message.guild || !message.member) {
        message.channel.send([
            "Can't use commands in DM's.",
            "Go to the server and try using the command.",
        ]);
        return;
    }
    log.debug(f("main", `Message Contents: ${message.content}`));

    // Parse through message.content
    const rawArgs = message.content.toLowerCase().slice(prefix.length).split(/[ ]+/);
    const rawCommand = rawArgs.shift();
    log.debug(f("main", `Command: ${rawCommand}`));
    log.debug(f("main", `Raw Arguments: ${rawArgs}`));

    // If the command is not found in the aliases
    if (!(rawCommand && commandAliases.has(rawCommand))) {
        log.debug(f("main", `Command '${rawCommand}' not found.`));
        message.reply(`Unknown command \`${prefix}${rawCommand}\` not found.`);
        return;
    }

    // Retrieve command definition
    const commandAlias = commandAliases.get(rawCommand)!;
    const command = commands.get(commandAlias)!;
    log.debug(f("main", `Command '${rawCommand}' alias detected as ${command.name}`));

    // If command is disabled stop here
    if (command.enabled === false) {
        log.debug(f("main", `Command '${rawCommand}' is disabled.`));
        message.channel.send(`\`${prefix}${rawCommand}\` is disabled.`);
        return;
    }

    // Attempt to parse args and run the command
    try {
        const args = await parseArgs(rawArgs, command.arguments, message.guild!);
        log.debug(f("main", `Parsed arguments: ${JSON.stringify(args, null, 2)}`));
        await command.run(message, args);
    } catch (error) {
        if (error instanceof ArgumentUsageError) {
            message.reply(["`Invalid command usage`", `\`${error.message}\``]);
        } else if (error instanceof ArgumentCustomValidationError) {
            message.reply([
                "`Invalid command usage: Did not pass the requirements.`",
                "`Check the help command for more information.`",
                `\`${error.message}\``,
            ]);
        } else {
            message.reply([
                `An error occurred while running the command: \`${
                    (error as Error).message
                }\``,
                "You shouldn't ever receive an error like this.",
                "Please contact the bot admin.",
            ]);
        }
        process.stderr.write("CommandExecutionError: ");
        log.error(error);
    }
});

client.login(token);
