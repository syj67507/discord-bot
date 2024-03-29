import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";
import { commands, commandGroups, commandAliases } from "../..";

const disableCommand: Command = {
    name: "disable",
    description: "Disables a command from being used",
    enabled: true,
    arguments: [
        {
            key: "command",
            type: "string",
            description: "The command to disable",
        },
    ],
    async run(message: Message, args: ArgumentValues) {
        // Check if user has permissions to use this command
        if (!message.member!.permissions.has("ADMINISTRATOR")) {
            message.reply("You do not have permissions to disable commands.");
            return null;
        }

        // Check to see if command exists
        if (commandAliases.has(args.command as string) === false) {
            message.reply(`Unable to disable: \`${args.command}\` not found.`);
            return null;
        }

        // Command exists, get definition
        const commandName = commandAliases.get(args.command as string)!;
        const command = commands.get(commandName)!;

        // Check if the command is a utiliy command
        // (not allowed to disable utility commands)
        if (commandGroups.get("utility")!.includes(command.name)) {
            message.reply("Can't disable a utility command.");
            return null;
        }

        // Check if it is already enabled
        if (command.enabled === false) {
            message.reply(`\`${args.command}\` is already disabled.`);
            return null;
        }

        // Disable
        command.enabled = false;
        message.reply(`\`${args.command}\` disabled.`);
        return null;
    },
};

export default disableCommand;
