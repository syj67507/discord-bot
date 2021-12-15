// import "dotenv/config";
// import { Collection, Message } from "discord.js";
// import { Argument, ArgumentValues, Command } from "../../custom/base";
// import { commands, commandGroups, commandAliases } from "../..";

// const helpCommand: Command = {
//     name: "help",
//     description: "Provides help information about all available commands",
//     arguments: [
//         {
//             key: "commandName",
//             type: "string",
//             description: "The command to receive information for",
//             default: "all",
//         },
//     ],
//     aliases: ["h"],
//     enabled: true,
//     async run(message: Message, args: ArgumentValues) {
//         // Fetch the DM Channel to send the help information to
//         let dmChannel = message.author.dmChannel;
//         if (dmChannel === null) {
//             dmChannel = await message.author.createDM();
//         }

//         const prefix: string = process.env.PREFIX!;

//         let helpMessage: string[] = [];

//         // Based on input, fill in the helpMessage
//         const commandName = args.commandName as string;
//         if (args.commandName === "all") {
//             helpMessage = makeHelpAllMessage(prefix, commands, commandGroups);
//         } else if (commands.has(commandName)) {
//             const command = commands.get(commandName)!;
//             helpMessage = makeSpecificHelpMessage(command);
//         } else if (commandAliases.has(commandName)) {
//             const cmdName = commandAliases.get(commandName)!;
//             const command = commands.get(cmdName)!;
//             helpMessage = makeSpecificHelpMessage(command);
//         } else {
//             helpMessage = [
//                 "Unable to identify this command. Use the help " +
//                     "command to see a list of all the available commands.",
//             ];
//         }

//         dmChannel.send(helpMessage);
//         return null;
//     },
// };

// /**
//  * Takes a string and returns a string where the first letter is capitalized like a title
//  * @param s The string to capitalize
//  * @returns {string} The string that has been capitalized
//  */
// function capitalize(s: string): string {
//     if (s.length === 0) {
//         return s;
//     }
//     return s.slice(0, 1).toUpperCase() + s.slice(1);
// }

// /**
//  * Returns an array of messages that contains information about all commands and how to use them
//  * @param prefix The command prefix for this client
//  * @param commands The collection that contains all of the command definitions (from loadedCommands)
//  * @param commandGroups The collection that contains all the groups and all of its commands (from loadedCommands)
//  * @returns {string[]} The help message
//  */
// function makeHelpAllMessage(
//     prefix: string,
//     // eslint-disable-next-line no-shadow
//     commands: Collection<string, Command>,
//     // eslint-disable-next-line no-shadow
//     commandGroups: Collection<string, string[]>
// ): string[] {
//     const helpMessage = [
//         `To run a command, use \`${prefix}command\` in any text channel provided on the server.`,
//         `Use \`${prefix}help <command>\` to view detailed information about a specific command.`,
//         "Any commands that are ~~crossed out~~ are currently disabled.",
//         "",
//         "__**Available commands**__",
//         "",
//     ];

//     for (const commandGroupName of commandGroups.keys()) {
//         const commandGroup = commandGroups.get(commandGroupName)!;
//         helpMessage.push(`__${capitalize(commandGroupName)}__`);

//         for (const commandName of commandGroup) {
//             const command = commands.get(commandName)!;
//             let m = `**${command.name}:** ${command.description}`;
//             if (command.enabled === false) {
//                 m = `~~${m}~~`;
//             }
//             helpMessage.push(m);
//         }
//         helpMessage.push("");
//     }
//     return helpMessage;
// }

// /**
//  * Makes a help message for a specific command
//  * @param command The command to make a help message for
//  * @returns {string[]} An array of strings of all the command details
//  */
// function makeSpecificHelpMessage(command: Command): string[] {
//     const {
//         aliases,
//         description,
//         enabled,
//         name,
//         arguments: args,
//         additionalHelpInfo,
//     } = command;

//     const msg = [
//         `__Command **${name}**__`,
//         description,
//         `Currently ${enabled === false ? "**disabled**" : "**enabled**"}`,
//         "",
//     ];

//     if (aliases && aliases.length > 0) {
//         msg.push(`**Aliases:** \`[${aliases}]\``);
//     }

//     if (additionalHelpInfo && additionalHelpInfo.length > 0) {
//         msg.push("", ...additionalHelpInfo, "");
//     }

//     if (args.length > 0) {
//         const { usageArgs, argDetails } = makeArgDescriptions(args);
//         msg.push(
//             `**Usage:** \`${name} ${usageArgs}\``,
//             "",
//             "**Arguments:**",
//             ...argDetails
//         );
//     }

//     return msg;
// }

// /**
//  * Returns an object that parses the passed arguments for use in generating a help message
//  * @param args: an array of arguments
//  * @returns usageArgs, a string with all arguments
//  * @returns argDetails, an array where each entry is detailed information about an argument
//  */
// function makeArgDescriptions(args: Argument[]): any {
//     let usageArgs = "";
//     const argDetails: string[] = [];
//     for (const arg of args) {
//         const { key, description, default: defValue } = arg;
//         usageArgs += `<${key}> `;
//         let argDescription = `\`<${key}>\` ${description}`;
//         if (defValue !== undefined) {
//             argDescription += `, default: \`${defValue}\``;
//         }
//         argDetails.push(argDescription);
//     }
//     return { usageArgs, argDetails };
// }

// export default helpCommand;
// const helpers = {
//     capitalize,
//     makeHelpAllMessage,
//     makeSpecificHelpMessage,
//     makeArgDescriptions,
// };
// export { helpers };
