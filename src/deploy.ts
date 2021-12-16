/* eslint-disable @typescript-eslint/no-var-requires */
import fs from "fs";
import "dotenv/config";
import {
    SlashCommandBuilder,
    SlashCommandUserOption,
    SlashCommandBooleanOption,
    SlashCommandNumberOption,
    SlashCommandIntegerOption,
    SlashCommandStringOption,
} from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Command, OptionTypes } from "./custom/base";
import { Routes } from "discord-api-types/v9";

const clientId = process.env.CLIENT_ID!;
const guildId = process.env.GUILD_ID!;
const token = process.env.TOKEN!;

const rest = new REST({ version: "9" }).setToken(token);

const commands = []; // Loads in all of the commands into array for deployment

const groups = fs.readdirSync(`${__dirname}/commands`);
for (const group of groups) {
    const commandFiles = fs.readdirSync(`${__dirname}/commands/${group}`);

    for (const commandFile of commandFiles) {
        const path = `${__dirname}/commands/${group}/${commandFile}`.replace(".ts", "");

        const command: Command = require(path).default;
        if (command) {
            // build the command for deployment
            const builtCommand = new SlashCommandBuilder()
                .setName(command.name)
                .setDescription(command.description);
            if (command.options && command.options.length !== 0) {
                console.log(command.options[0].choices);
            }

            // build the options for each command
            for (const option of command.options) {
                // Prepare choices if it exists
                let choices: [name: string, value: any][] = [];
                if (option.choices) {
                    choices = option.choices.map((choice) => {
                        return [choice.toString(), choice];
                    });
                }

                if (option.type === OptionTypes.BOOLEAN) {
                    builtCommand.addBooleanOption(
                        new SlashCommandBooleanOption()
                            .setName(option.name)
                            .setDescription(option.description)
                            .setRequired(option.required)
                    );
                } else if (option.type === OptionTypes.NUMBER) {
                    builtCommand.addNumberOption(
                        new SlashCommandNumberOption()
                            .setName(option.name)
                            .setDescription(option.description)
                            .setRequired(option.required)
                            .addChoices(choices)
                    );
                } else if (option.type === OptionTypes.INTEGER) {
                    builtCommand.addIntegerOption(
                        new SlashCommandIntegerOption()
                            .setName(option.name)
                            .setDescription(option.description)
                            .setRequired(option.required)
                            .addChoices(choices)
                    );
                } else if (option.type === OptionTypes.STRING) {
                    const stringOption = new SlashCommandStringOption()
                        .setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required)
                        .addChoices(choices);
                    builtCommand.addStringOption(stringOption);
                } else if (option.type === OptionTypes.USER) {
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

            console.log("Deploying", command.name);
            commands.push(builtCommand.toJSON());
        }
    }
}

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log("Successfully registered application commands."))
    .catch(console.error);
