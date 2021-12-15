import "dotenv/config";
import { Client, CommandInteraction, Intents, Interaction } from "discord.js";
import { parseOptions } from "./custom/base";
import { loadCommands } from "./custom/loadCommands";
// import { ArgumentUsageError } from "./errors/ArgumentUsageError";
// import { ArgumentCustomValidationError } from "./errors/ArgumentCustomValidationError";
// import registerGCP from "./custom/register-gcp";
import { logger as log, format as f } from "./custom/logger";
// // import { setNicknameCycle } from "./custom/nicknameCycle";

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
const token = process.env.TOKEN;
// const prefix = process.env.PREFIX!;

log.info(f("main", "Loading commands..."));
export const { commands, commandAliases, commandGroups } = loadCommands(__dirname);
log.info(f("main", "Commands loaded."));

// registerGCP();

// const hourInMilliseconds = 3600000;
// const guildIds = process.env.NICKNAME_CYCLE_GUILD_IDS?.split("/") || [];
// const nicknames = process.env.NICKNAME_CYCLE_NAMES?.split("/") || [];
// if (guildIds.length === nicknames.length) {
//     for (let i = 0; i < guildIds.length; i++) {
//         const guildId = guildIds[i];
//         const names = nicknames[i].split(",");
//         setNicknameCycle(
//             client,
//             guildIds[i],
//             nicknames[i].split(","),
//             hourInMilliseconds
//         );
//         log.info(`Nickname cycle set for ${guildId} with the names: ${names}`);
//     }
// } else {
//     log.error(f("main", "Unable to set up the nicknames cycles for differing lengths."));
// }

client.once("ready", () => {
    console.log(`Logged in ${client?.user?.id} as ${client?.user?.tag}`);
});

client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const i = interaction as CommandInteraction;
    log.debug(
        f(
            "main",
            `${i.commandName} triggered by ${i.member.user.username} - ${i.member.user.id}`
        )
    );

    log.debug(f("main", `Raw options: ${JSON.stringify(i.options.data, null, 2)}`));

    // Attempt to parse args and run the command
    try {
        const options = await parseOptions(i, commands.get(i.commandName)!);
        log.debug(f("main", `Parsed options: ${JSON.stringify(options, null, 2)}`));
        await commands.get(i.commandName)!.run(i, options);
    } catch (error) {
        if (error instanceof Error) {
            await interaction.reply(
                [
                    `An error occurred while running the command: \`${
                        (error as Error).message
                    }\``,
                    "You shouldn't ever receive an error like this.",
                    "Please contact the bot admin.",
                ].join("\n")
            );
        }
        process.stderr.write("CommandExecutionError: ");
        log.error(error);
    }
});

// client.on("message", async (message) => {
//     if (message.author.bot) {
//         return;
//     }
//     if (!message.content.startsWith(prefix)) {
//         return;
//     }
//     if (!message.guild || !message.member) {
//         message.channel.send([
//             "Can't use commands in DM's.",
//             "Go to the server and try using the command.",
//         ]);
//         return;
//     }
//     log.debug(f("main", `Message Contents: ${message.content}`));

//     // Parse through message.content
//     const rawArgs = message.content.slice(prefix.length).split(/[ ]+/);
//     const rawCommand = rawArgs.shift()!.toLowerCase();
//     log.debug(f("main", `Command: ${rawCommand}`));
//     log.debug(f("main", `Raw Arguments: ${rawArgs}`));

//     // If the command is not found in the aliases
//     if (!(rawCommand && commandAliases.has(rawCommand))) {
//         log.debug(f("main", `Command '${rawCommand}' not found.`));
//         message.reply(`Unknown command \`${prefix}${rawCommand}\` not found.`);
//         return;
//     }

//     // Retrieve command definition
//     const commandAlias = commandAliases.get(rawCommand)!;
//     const command = commands.get(commandAlias)!;
//     log.debug(f("main", `Command '${rawCommand}' alias detected as ${command.name}`));

//     // If command is disabled stop here
//     if (command.enabled === false) {
//         log.debug(f("main", `Command '${rawCommand}' is disabled.`));
//         message.channel.send(`\`${prefix}${rawCommand}\` is disabled.`);
//         return;
//     }

//     // Attempt to parse args and run the command
//     try {
//         const args = await parseArgs(rawArgs, command.arguments, message.guild!);
//         log.debug(f("main", `Parsed arguments: ${JSON.stringify(args, null, 2)}`));
//         await command.run(message, args);
//     } catch (error) {
//         if (error instanceof ArgumentUsageError) {
//             message.reply(["`Invalid command usage`", `\`${error.message}\``]);
//         } else if (error instanceof ArgumentCustomValidationError) {
//             message.reply([
//                 "`Invalid command usage: Did not pass the requirements.`",
//                 "`Check the help command for more information.`",
//                 `\`${error.message}\``,
//             ]);
//         } else {
//             message.reply([
//                 `An error occurred while running the command: \`${
//                     (error as Error).message
//                 }\``,
//                 "You shouldn't ever receive an error like this.",
//                 "Please contact the bot admin.",
//             ]);
//         }
//         process.stderr.write("CommandExecutionError: ");
//         log.error(error);
//     }
// });

client.login(token);
