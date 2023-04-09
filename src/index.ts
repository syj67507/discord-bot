import "dotenv/config";
import { Client, GatewayIntentBits, Interaction } from "discord.js";
import { parseOptions } from "./custom/base";
import { loadCommands } from "./custom/loadCommands";
// import { ArgumentUsageError } from "./errors/ArgumentUsageError";
// import { ArgumentCustomValidationError } from "./errors/ArgumentCustomValidationError";
// import registerGCP from "./custom/register-gcp";
import { logger as log, format as f } from "./custom/logger";
// // import { setNicknameCycle } from "./custom/nicknameCycle";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
});
const token = process.env.TOKEN!;
const guildId = process.env.GUILD_ID!;

log.info(f("main", "Loading commands..."));
const { commands, commandGroups, commandAliases } = loadCommands(__dirname);
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

client.once("ready", async () => {
    // console.log("Resetting disabled commands status...");
    // const fetchedGuild = await client.guilds.fetch({
    //     guild: guildId,
    // });
    // const currentPermissions = await fetchedGuild.commands.permissions.fetch({});
    // currentPermissions.forEach(async (commandPerms, commandId) => {
    //     for (const perm of commandPerms) {
    //         (await client.guilds.fetch({ guild: guildId })).commands.permissions.remove({
    //             command: commandId,
    //             roles: perm.id,
    //         });
    //     }
    // });
    // console.log("Reset complete. Commands are all enabled.");

    console.log(`Logged in ${client?.user?.id} as ${client?.user?.tag}`);
});

client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    log.debug(
        f(
            "main",
            `${interaction.commandName} triggered by ${
                interaction.member!.user.username
            } - ${interaction.member!.user.id}`
        )
    );

    log.debug(
        f("main", `Raw options: ${JSON.stringify(interaction.options.data, null, 2)}`)
    );

    // Convert alias into original command
    const command = commands.get(commandAliases.get(interaction.commandName)!)!;

    // Attempt to parse args and run the command
    try {
        const options = await parseOptions(interaction, command);
        log.debug(f("main", `Parsed options: ${JSON.stringify(options, null, 2)}`));
        await command.run(interaction, options, commands, commandGroups);
    } catch (error) {
        if (error instanceof Error) {
            const msg = [
                `An error occurred while running the command: \`${error.message}\``,
                "You shouldn't ever receive an error like this.",
                "Please contact the bot admin.",
            ].join("\n");
            console.log(error);
            if (interaction.deferred) {
                await interaction.deleteReply();
                await interaction.followUp({ content: msg, ephemeral: true });
            } else {
                await interaction.reply({ content: msg, ephemeral: true });
            }
        }
        process.stderr.write("CommandExecutionError: ");
        log.error(error);
    }
});

client.login(token);
