import "dotenv/config";
import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";
import { commands, commandGroups } from "../..";

const command: Command = {
    name: "help",
    description: "Provides help information about all available commands",
    arguments: [
        {
            key: "command",
            type: "string",
            description: "The command to receive information for",
            default: "",
        },
    ],
    async run(message: Message, args: ArgumentValues) {
        let dmChannel = message.author.dmChannel;
        if (dmChannel === null) {
            dmChannel = await message.author.createDM();
        }
        let helpMessage = [
            `To run a command, use \`${process.env.prefix}command\` in any text channel provided on the server.`,
            `Use \`${process.env.prefix}help <command>\` to view detailed information about a specific command.`,
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
        dmChannel.send(helpMessage);
        return null;
    },
    aliases: ["h"],
};

/**
 * Takes a string and returns a string where the first letter is capitalized like a title
 * @param s The string to capitalize
 */
function capitalize(s: string): string {
    if (s.length === 0) {
        return s;
    }
    return s.slice(0, 1).toUpperCase() + s.slice(1);
}

export default command;
