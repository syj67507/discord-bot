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

const { commands } = loadCommands(__dirname);
commands.forEach((command) => {
    log.info(f("deploy", `Deploying ${command.name}`));
    const builtCommand = new SlashCommandBuilder()
        .setName(command.name)
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

        if (option.type === OptionType.Boolean) {
            builtCommand.addBooleanOption(
                new SlashCommandBooleanOption()
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required)
            );
        } else if (option.type === OptionType.Number) {
            builtCommand.addNumberOption(
                new SlashCommandNumberOption()
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required)
                    .addChoices(
                        ...(choices as APIApplicationCommandOptionChoice<number>[])
                    )
            );
        } else if (option.type === OptionType.Integer) {
            builtCommand.addIntegerOption(
                new SlashCommandIntegerOption()
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required)
                    .addChoices(
                        ...(choices as APIApplicationCommandOptionChoice<number>[])
                    )
            );
        } else if (option.type === OptionType.String) {
            builtCommand.addStringOption(
                new SlashCommandStringOption()
                    .setName(option.name)
                    .setDescription(option.description)
                    .setRequired(option.required)
                    .addChoices(
                        ...(choices as APIApplicationCommandOptionChoice<string>[])
                    )
            );
        } else if (option.type === OptionType.User) {
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
