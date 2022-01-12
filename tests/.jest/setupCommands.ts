/**
 * This file sets up the commands Collection so that is available for each test file.
 */

import { Collection } from "discord.js";
import { Command } from "../../src/custom/base";
import fs from "fs";
import path from "path";

const commands = new Collection<string, Command>();
const commandGroups = new Collection<string, string[]>();

// loading all commands defined in application
const groups = fs.readdirSync(path.resolve(`${__dirname}/../../src/commands`));
for (const group of groups) {
    const commandFiles = fs.readdirSync(
        path.resolve(`${__dirname}/../../src/commands/${group}`)
    );
    commandGroups.set(group, []);
    for (const commandFile of commandFiles) {
        const p = `${__dirname}/../../src/commands/${group}/${commandFile}`.replace(
            ".ts",
            ""
        );

        const command: Command = require(p).default;
        if (command) {
            commands.set(command.name, command);
            commandGroups.get(group)!.push(command.name);
        }
    }
}

commands.set("sample", {
    name: "sample",
    description: "Sample Description",
    aliases: ["alias"],
    enabled: true,
    run: async () => {
        return null;
    },
    options: [],
});

commands.set("sampleUtility", {
    name: "sampleUtility",
    description: "Sample Utility Description",
    aliases: ["aliasUtility"],
    enabled: true,
    run: async () => {
        return null;
    },
    options: [],
});

commandGroups.get("misc").push("sample");
commandGroups.get("utility").push("sampleUtility");

global["commands"] = commands;
global["commandGroups"] = commandGroups;
