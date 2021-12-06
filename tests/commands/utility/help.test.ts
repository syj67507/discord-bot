import "dotenv/config";
import { Collection } from "discord.js";
import { Command } from "../../../src/custom/base";

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
                message.author.dmChannel = dmChannel;
                return dmChannel;
            },
            dmChannel: null,
        },
    };

    // reimport modules before each test to reset the loaded command definitions before each test
    let commands: Collection<string, Command>;
    let commandGroups: Collection<string, string[]>;
    let helpCommand: Command;
    let helpCommandHelpers;

    // snapshots
    const helpAllMessageSnapshot = [
        "To run a command, use `-command` in any text channel provided on the server.",
        "Use `-help <command>` to view detailed information about a specific command.",
        "Any commands that are ~~crossed out~~ are currently disabled.",
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

        // mocking the loadCommands for all commands/aliases/groups and its export (src/__mocks__/index.ts)
        jest.mock("../../../src/index");
        jest.resetModules(); // future imports of the same module will be replaced with the new instance on the import call

        const loadedCommands = await import("../../../src/index");
        commands = loadedCommands.commands;
        commandGroups = loadedCommands.commandGroups;

        // help command imported here to use the mocked imports of the loadedCommands in index.ts
        const module = await import("../../../src/commands/utility/help");
        helpCommand = module.default;
        helpCommandHelpers = module.helpers;

        // reset the message's dmChannel
        message.author.dmChannel = null;
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
            expect(result.join(" ").includes("Available commands")).toBe(true);
        });

        it("Should make a help message for the sample command containing the usage and description", () => {
            const { makeSpecificHelpMessage } = helpCommandHelpers;
            const result = makeSpecificHelpMessage(commands.get("sample"));
            expect(result.join(" ").includes("Usage")).toBe(true);
            expect(result.join(" ").includes(commands.get("sample").description)).toBe(
                true
            );
        });

        it("Should make a help message with sample crossed out when disabled in help all message", async () => {
            const { makeHelpAllMessage } = helpCommandHelpers;
            const prefix = process.env.PREFIX!;

            const disableCommand = (await import("../../../src/commands/utility/disable"))
                .default;
            await disableCommand.run(message, {
                command: "sample",
            });

            const result = makeHelpAllMessage(prefix, commands, commandGroups);
            expect(result.join(" ").includes("~~**sample")).toBe(true); // ~~**word~~ is the way to cross out a bolded word
        });

        it("should make a help message for the sample command with additional help info if specified", async () => {
            const { makeSpecificHelpMessage } = helpCommandHelpers;

            const sampleCommand = commands.get("sample")!;
            sampleCommand.additionalHelpInfo = ["Sample Additional Info"];
            commands.set("sample", sampleCommand);

            const result = makeSpecificHelpMessage(commands.get("sample"));
            expect(
                result
                    .join(" ")
                    .includes(commands.get("sample").additionalHelpInfo.join(" "))
            ).toBe(true);
        });

        it("Should say this command is currently disabled when disabled in specific help message", async () => {
            const { makeSpecificHelpMessage } = helpCommandHelpers;

            const disableCommand = (await import("../../../src/commands/utility/disable"))
                .default;
            await disableCommand.run(message, {
                command: "sample",
            });

            const result = makeSpecificHelpMessage(commands.get("sample"));
            expect(result.join(" ").includes("disabled")).toBe(true);
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

        it("should not create a new dmChannel if one already exists", async () => {
            const args = {
                commandName: "all",
            };

            message.author.dmChannel = dmChannel;
            const createDMSpy = jest.spyOn(message.author, "createDM");

            await helpCommand.run(message, args);

            expect(createDMSpy).toHaveBeenCalledTimes(0);
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
