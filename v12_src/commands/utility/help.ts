import "dotenv/config";
import { Collection, Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";
import { commands, commandGroups, commandAliases } from "../..";

const helpCommand: Command = {
    name: "help",
    description: "Provides help information about all available commands",
    arguments: [
        {
            key: "commandName",
            type: "string",
            description: "The command to receive information for",
            default: "all",
        },
    ],
    aliases: ["h"],
    async run(message: Message, args: ArgumentValues) {
        // Fetch the DM Channel to send the help information to
        // let dmChannel = message.author.dmChannel;
        let dmChannel = message.channel;
        if (dmChannel === null) {
            dmChannel = await message.author.createDM();
        }

        const prefix: string = process.env.PREFIX!;

        let helpMessage: string[] = [];

        // Based on input, fill in the helpMessage
        const { commandName } = args;
        if (args.commandName === "all") {
            helpMessage = makeHelpAllMessage(prefix, commands, commandGroups);
        } else if (commands.has(commandName as string)) {
            const command = commands.get(commandName as string)!;
            helpMessage = makeSpecificHelpMessage(command);
        } else if (commandAliases.has(commandName as string)) {
            const cmdName = commandAliases.get(commandName as string)!;
            const command = commands.get(cmdName)!;
            helpMessage = makeSpecificHelpMessage(command);
        } else {
            helpMessage = [
                "Unable to identify this command. Use the help " +
                    "command to see a list of all the available commands.",
            ];
        }

        dmChannel.send(helpMessage);
        return null;
    },
};

/**
 * Takes a string and returns a string where the first letter is capitalized like a title
 * @param s The string to capitalize
 * @returns {string} The string that has been capitalized
 */
function capitalize(s: string): string {
    if (s.length === 0) {
        return s;
    }
    return s.slice(0, 1).toUpperCase() + s.slice(1);
}

/**
 * Returns an array of messages that contains information about all commands and how to use them
 * @param prefix The command prefix for this client
 * @param commands The collection that contains all of the command definitions
 * @param commandGroups The collection that contains all the groups and all of its commands
 * @returns {string[]} The help message
 */
function makeHelpAllMessage(
    prefix: string,
    commands: Collection<string, Command>,
    commandGroups: Collection<string, string[]>
): string[] {
    const helpMessage = [
        `To run a command, use \`${prefix}command\` in any text channel provided on the server.`,
        `Use \`${prefix}help <command>\` to view detailed information about a specific command.`,
        "",
        "__**Available commands**__",
        "",
    ];

    for (const commandGroupName of commandGroups.keys()) {
        const commandGroup = commandGroups.get(commandGroupName)!;
        helpMessage.push(`__${capitalize(commandGroupName)}__`);

        for (const commandName of commandGroup) {
            const command = commands.get(commandName)!;
            helpMessage.push(`**${command.name}:** ${command.description}`);
        }
        helpMessage.push("");
    }
    return helpMessage;
}

/**
 * Makes a help message for a specific command
 * @param command The command to make a help message for
 * @returns {string[]} An array of strings of all the command details
 */
function makeSpecificHelpMessage(command: Command): string[] {
    const { aliases, description, name, arguments: args } = command;

    let usageArgs: string = "";
    let argDetails: string[] = [];
    for (const arg of args) {
        const { key, description, default: defValue } = arg;
        usageArgs += `<${key}> `;
        let argDescription = `\`<${key}>\` ${description}`;
        if (defValue !== undefined) {
            argDescription += `, default: \`${defValue}\``;
        }
        argDetails.push(argDescription);
    }
    return [
        `__Command **${name}**__`,
        description,
        "",
        `**Usage:** \`${name} ${usageArgs}\``,
        `**Aliases:** \`[${aliases}]\``,
        "",
        "**Arguments:**",
        ...argDetails,
    ];
}

export default helpCommand;
