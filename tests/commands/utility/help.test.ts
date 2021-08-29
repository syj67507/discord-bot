import "dotenv/config";
import { Collection } from "discord.js";
import { Command } from "../../../v12_src/custom/base";

describe("Testing help command", () => {
    // mocking Discord.Message
    const dmChannel: any = {
        send: jest.fn(),
    };
    const message: any = {
        content: "",
        channel: {
            send: jest.fn(),
        },
        reply: jest.fn(),
        member: {
            permissions: {
                has(perm: string): boolean {
                    return perm === "ADMINISTRATOR";
                },
            },
        },
        author: {
            createDM: async () => {
                return dmChannel;
            },
            dmChannel: null,
        },
    };

    // reimport modules before each test to reset the loaded command definitions before each test
    let commands: Collection<string, Command>;
    let commandAliases: Collection<string, string>;
    let commandGroups: Collection<string, string[]>;
    let helpCommand: Command;
    let helpCommandHelpers;

    // snapshots
    const helpAllMessageSnapshot = [
        "To run a command, use `-command` in any text channel provided on the server.",
        "Use `-help <command>` to view detailed information about a specific command.",
        "Any commands that ~~crossed out~~ are currently disabled.",
        "",
        "__**Available commands**__",
        "",
        "__Misc__",
        "**sample:** Sample Description",
        "",
        "__Utility__",
        "**sampleUtility:** Sample Utility Description",
        "",
    ];
    const helpSampleCommandSnapshot = [
        "__Command **sample**__",
        "Sample Description",
        "Currently **enabled**",
        "",
        "**Aliases:** `[alias]`",
        "**Usage:** `sample <key1> `",
        "",
        "**Arguments:**",
        "`<key1>` argument description, default: `0`",
    ];

    const helpAllMessageDisabledSnapshot = [
        "To run a command, use `-command` in any text channel provided on the server.",
        "Use `-help <command>` to view detailed information about a specific command.",
        "Any commands that ~~crossed out~~ are currently disabled.",
        "",
        "__**Available commands**__",
        "",
        "__Misc__",
        "~~**sample:** Sample Description~~",
        "",
        "__Utility__",
        "**sampleUtility:** Sample Utility Description",
        "",
    ];
    const helpSampleCommandDisabledSnapshot = [
        "__Command **sample**__",
        "Sample Description",
        "Currently **disabled**",
        "",
        "**Aliases:** `[alias]`",
        "**Usage:** `sample <key1> `",
        "",
        "**Arguments:**",
        "`<key1>` argument description, default: `0`",
    ];
    const helpArgDescriptionSnapshot = {
        argDetails: ["`<key1>` argument description, default: `0`"],
        usageArgs: "<key1> ",
    };
    const helpCommandNotFoundMessageSnapshot = [
        "Unable to identify this command. Use the help " +
            "command to see a list of all the available commands.",
    ];

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        jest.mock("../../../v12_src/index");
        jest.resetModules(); // future imports of the same module will be replaced with the new instance on the import call

        const loadedCommands = await import("../../../v12_src/index");
        commands = loadedCommands.commands;
        commandAliases = loadedCommands.commandAliases;
        commandGroups = loadedCommands.commandGroups;

        const module = await import("../../../v12_src/commands/utility/help");
        helpCommand = module.default;
        helpCommandHelpers = module.helpers;
    });

    describe("Testing helper functions", () => {
        it("Should capitalize the string", () => {
            const { capitalize } = helpCommandHelpers;
            const s = "test";
            const result = capitalize(s);
            expect(result).toBe("Test");
        });

        it("Should not capitalize an empty string", () => {
            const { capitalize } = helpCommandHelpers;
            const s = "";
            const result = capitalize(s);
            expect(result).toBe(s);
        });

        it("Should make detailed argument description object from arguments", () => {
            const { makeArgDescriptions } = helpCommandHelpers;
            const sampleCommand = commands.get("sample");
            const result = makeArgDescriptions(sampleCommand.arguments);
            expect(result).toEqual(helpArgDescriptionSnapshot);
        });

        it("Should make a help all message", () => {
            const { makeHelpAllMessage } = helpCommandHelpers;
            const prefix = process.env.PREFIX!;
            const result = makeHelpAllMessage(prefix, commands, commandGroups);
            expect(result).toEqual(helpAllMessageSnapshot);
        });

        it("Should make a help message for the sample command", () => {
            const { makeSpecificHelpMessage } = helpCommandHelpers;
            const result = makeSpecificHelpMessage(commands.get("sample"));
            expect(result).toEqual(helpSampleCommandSnapshot);
        });

        it("Should make a help message with sample crossed out when disabled", async () => {
            const { makeHelpAllMessage } = helpCommandHelpers;
            const prefix = process.env.PREFIX!;

            const disableCommand = (
                await import("../../../v12_src/commands/utility/disable")
            ).default;
            await disableCommand.run(message, {
                command: "sample",
            });

            const result = makeHelpAllMessage(prefix, commands, commandGroups);
            expect(result).toEqual(helpAllMessageDisabledSnapshot);
        });

        it("Should say this command is currently disabled out when disabled", async () => {
            const { makeSpecificHelpMessage } = helpCommandHelpers;

            const disableCommand = (
                await import("../../../v12_src/commands/utility/disable")
            ).default;
            await disableCommand.run(message, {
                command: "sample",
            });

            const result = makeSpecificHelpMessage(commands.get("sample"));
            expect(result).toEqual(helpSampleCommandDisabledSnapshot);
        });
    });

    describe("Testing help command's run function", () => {
        it("should send a summary of all the commands", async () => {
            const args = {
                commandName: "all",
            };

            const sendSpy = jest.spyOn(dmChannel, "send");
            await helpCommand.run(message, args);
            expect(sendSpy).toHaveBeenCalledTimes(1);
            expect(sendSpy).toHaveBeenLastCalledWith(helpAllMessageSnapshot);
        });

        it("should send a detailed description of the sample command", async () => {
            const args = {
                commandName: "sample",
            };

            const sendSpy = jest.spyOn(dmChannel, "send");
            await helpCommand.run(message, args);
            expect(sendSpy).toHaveBeenCalledTimes(1);
            expect(sendSpy).toHaveBeenLastCalledWith(helpSampleCommandSnapshot);
        });

        it("should send a detailed description of the sample command using the alias", async () => {
            const args = {
                commandName: "alias",
            };

            const sendSpy = jest.spyOn(dmChannel, "send");
            await helpCommand.run(message, args);
            expect(sendSpy).toHaveBeenCalledTimes(1);
            expect(sendSpy).toHaveBeenLastCalledWith(helpSampleCommandSnapshot);
        });

        it("should send an error message if not a valid command", async () => {
            const args = {
                commandName: "unknown",
            };

            const sendSpy = jest.spyOn(dmChannel, "send");
            await helpCommand.run(message, args);
            expect(sendSpy).toHaveBeenCalledTimes(1);
            expect(sendSpy).toHaveBeenLastCalledWith(helpCommandNotFoundMessageSnapshot);
        });
    });
});
