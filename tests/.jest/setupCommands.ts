/**
 * This file sets up the commands Collection so that is available for each test file.
 */

import { Collection } from "discord.js";
import { Command } from "../../src/custom/base";

const commands = new Collection<string, Command>();

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

const commandGroups = new Collection<string, string[]>();
commandGroups.set("misc", ["sample"]);
commandGroups.set("utility", ["sampleUtility"]);

global["commands"] = commands;
global["commandGroups"] = commandGroups;
