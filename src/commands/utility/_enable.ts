// import { Collection, CommandInteraction, Role, Permissions } from "discord.js";
// import { Command, OptionType } from "../../custom/base";
// const enableCommand: Command = {
//     name: "enable",
//     description: "Enables a currently disabled command for use",
//     enabled: true,
//     options: [
//         {
//             name: "command",
//             description: "The command to enable",
//             type: OptionType.String,
//             required: true,
//         },
//     ],
//     async run(
//         interaction: CommandInteraction,
//         options: any,
//         commands: Collection<string, Command>
//     ) {
//         // Check if user has permissions to use this command
//         if (
//             !(interaction.member!.permissions as Permissions).has(
//                 Permissions.FLAGS.ADMINISTRATOR
//             )
//         ) {
//             interaction.reply("You do not have permissions to enable commands.");
//             return null;
//         }

//         const commandName = options.command as string;

//         // Check to see if command exists
//         if (commands.has(commandName) === false) {
//             interaction.reply(`Unable to enable: \`${options.command}\` not found.`);
//             return null;
//         }

//         // Command exists, get definition
//         const everyoneGuildRole = interaction.guild?.roles.cache.find(
//             (role: Role) => role.name === "@everyone"
//         );
//         let command = interaction.guild?.commands.cache.find((cmd) => {
//             return cmd.name === commandName;
//         });
//         if (!command) {
//             console.log("FETCHING");
//             command = (await interaction.guild?.commands.fetch())!.find((cmd) => {
//                 return cmd.name === commandName;
//             });
//         }

//         // Check if it is already enabled
//         const enabled =
//             (await command!.permissions.has({
//                 permissionId: everyoneGuildRole!.id,
//             })) === false;
//         if (enabled === true) {
//             interaction.reply(`\`${commandName}\` is already enabled.`);
//             return null;
//         }

//         // Enable
//         await command?.permissions.remove({
//             roles: everyoneGuildRole!.id,
//         });

//         interaction.reply(`\`${commandName}\` enabled.`);
//         const cmd = commands.get(commandName)!;
//         cmd.enabled = true;
//         return null;
//     },
// };

// export default enableCommand;
