/**
 * This file sets up the commands Collection so that is available for each test file.
 */

import { Collection } from "discord.js";
import { ApplicationCommandOptionType } from "discord-api-types";
import { Command } from "../../src/custom/base";
import fs from "fs";
import path from "path";

const applicationCommands = new Collection<string, Command>();
const applicationCommandGroups = new Collection<string, string[]>();
const testCommands = new Collection<string, Command>();
const testCommandGroups = new Collection<string, string[]>();

// loading all commands defined in application
const groups = fs.readdirSync(path.resolve(`${__dirname}/../../src/commands`));
for (const group of groups) {
    const commandFiles = fs.readdirSync(
        path.resolve(`${__dirname}/../../src/commands/${group}`)
    );
    applicationCommandGroups.set(group, []);
    for (const commandFile of commandFiles) {
        const p = `${__dirname}/../../src/commands/${group}/${commandFile}`.replace(
            ".ts",
            ""
        );

        const command: Command = require(p).default;
        if (command) {
            applicationCommands.set(command.name, command);
            applicationCommandGroups.get(group)!.push(command.name);
        }
    }
}

testCommands.set("sample", {
    name: "sample",
    description: "Sample Description",
    aliases: ["alias"],
    enabled: true,
    run: async () => {
        return null;
    },
    options: [
        {
            name: "key1",
            description: "option description",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
});

testCommands.set("sampleUtility", {
    name: "sampleUtility",
    description: "Sample Utility Description",
    aliases: ["aliasUtility"],
    enabled: true,
    run: async () => {
        return null;
    },
    options: [],
});

testCommandGroups.set("misc", ["sample"]);
testCommandGroups.set("utility", ["sampleUtility"]);

global["applicationCommands"] = applicationCommands;
global["applicationCommandGroups"] = applicationCommandGroups;
global["testCommands"] = testCommands;
global["testCommandGroups"] = testCommandGroups;
