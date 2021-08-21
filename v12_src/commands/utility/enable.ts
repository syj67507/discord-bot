import { Message } from "discord.js";
import { ArgumentValues, Command } from "../../custom/base";
import { commands, commandGroups, commandAliases } from "../..";

const enableCommand: Command = {
    name: "enable",
    description: "Enables a currently disabled command for use",
    enabled: true,
    arguments: [
        {
            key: "command",
            type: "string",
            description: "The command to enable",
        },
    ],
    async run(message: Message, args: ArgumentValues) {
        // Check if user has permissions to use this command
        if (!message.member?.permissions.has("ADMINISTRATOR")) {
            message.reply("You do not have permissions to enable commands.");
            return null;
        }

        // Check to see if command exists
        if (commandAliases.has(args.command as string) === false) {
            message.reply(`Unable to enable: \`${args.command}\` not found.`);
            return null;
        }

        // Command exists, get definition
        const commandName = commandAliases.get(args.command as string)!;
        const command = commands.get(commandName)!;

        // Check if it is already enabled
        if (command.enabled === true) {
            message.reply(`\`${args.command}\` is already enabled.`);
            return null;
        }

        // Enable
        command.enabled = true;
        message.reply(`\`${args.command}\` enabled.`);
        return null;
    },
};

export default enableCommand;
