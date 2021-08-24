import fs from "fs";
import { Collection } from "discord.js";
import { Command } from "./base";

/**
 * Loads all of the commands into the provided collections. This function mutates the provided collection parameters.
 * All commands are expected to be located inside of a commands folder with different 'groups' nested inside.
 * @param commandFolderPath The path of where the commands folder is located
 * @returns {LoadedCommands} An object containing several collections of command definitions/info
 */
export function loadCommands(commandFolderPath: string): LoadedCommands {
    // Loads in all of the commands into grouped collections
    const commands = new Collection<string, Command>();
    const commandAliases = new Collection<string, string>();
    const commandGroups = new Collection<string, string[]>();

    const groups = fs.readdirSync(`${commandFolderPath}/commands`); //);"./v12_src/commands");
    for (const group of groups) {
        let commandFiles = fs.readdirSync(`${commandFolderPath}/commands/${group}`); //`./v12_src/commands/${group}`);
        commandGroups.set(group, []);
        for (const commandFile of commandFiles) {
            const path = `${commandFolderPath}/commands/${group}/${commandFile}`.replace(
                ".ts",
                ""
            );
            const command: Command = require(path).default;
            commandAliases.set(command.name, command.name);
            if (command.aliases) {
                for (const alias of command.aliases) {
                    commandAliases.set(alias, command.name);
                }
            }
            commandGroups.get(group)?.push(command.name);
            commands.set(command.name, command);
        }
    }
    return {
        commands,
        commandAliases,
        commandGroups,
    };
}

interface LoadedCommands {
    /**A collection containing the default command name and the corresponding command definition */
    commands: Collection<string, Command>;
    /**A collection containing all of the aliases, mapping them to the corresponding default command name */
    commandAliases: Collection<string, string>;
    /**A collection of each command group and their default command names */
    commandGroups: Collection<string, string[]>;
}
