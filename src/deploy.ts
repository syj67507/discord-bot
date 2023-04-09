import "dotenv/config";
import {
    REST,
    Routes,
    SlashCommandBuilder,
    SlashCommandUserOption,
    SlashCommandBooleanOption,
    SlashCommandNumberOption,
    SlashCommandIntegerOption,
    SlashCommandStringOption,
    APIApplicationCommandOptionChoice,
} from "discord.js";
import { OptionType } from "./custom/base";
import { loadCommands } from "./custom/loadCommands";
import { logger as log, format as f } from "./custom/logger";

const clientId = process.env.CLIENT_ID!;
const guildId = process.env.GUILD_ID!;
const token = process.env.TOKEN!;

const rest = new REST({ version: "10" }).setToken(token);

const body: any = []; // Loads in all of the commands into array for deployment

const { commands, commandAliases } = loadCommands(__dirname);
console.log(commands.keys());
commandAliases.forEach((commandName, alias) => {
    const command = commands.get(commandName);
    if (command === undefined) {
        return;
    }
    log.info(f("deploy", `Deploying ${alias} with ${commandName}'s definition`));
    const builtCommand = new SlashCommandBuilder()
        .setName(alias)
        .setDescription(command.description);

    for (const option of command.options) {
        // Prepare choices if it exists
        const choices: APIApplicationCommandOptionChoice[] = [];
        if (option.choices) {
            option.choices.forEach((choice) => {
                choices.push({
                    name: choice.toString(),
                    value: choice,
                });
            });
        }

        if (option.type === "boolean") {
            builtCommand.addBooleanOption(
                new SlashCommandBooleanOption()
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required)
            );
        } else if (option.type === "number") {
            builtCommand.addNumberOption(
                new SlashCommandNumberOption()
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required)
                    .addChoices(
                        ...(choices as APIApplicationCommandOptionChoice<number>[])
                    )
            );
        } else if (option.type === "integer") {
            builtCommand.addIntegerOption(
                new SlashCommandIntegerOption()
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required)
                    .addChoices(
                        ...(choices as APIApplicationCommandOptionChoice<number>[])
                    )
            );
        } else if (option.type === "string") {
            builtCommand.addStringOption(
                new SlashCommandStringOption()
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required)
                    .addChoices(
                        ...(choices as APIApplicationCommandOptionChoice<string>[])
                    )
            );
        } else if (option.type === "user") {
            builtCommand.addUserOption(
                new SlashCommandUserOption()
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required)
            );
        } else {
            throw new Error(`OptionType not yet supported ${option.type}`);
        }
    }

    body.push(builtCommand.toJSON());
});

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: body })
    .then(() => console.log("Successfully registered application commands."))
    .catch(console.error);
