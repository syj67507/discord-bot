import { Collection } from "discord.js";
import { Command } from "../../../src/custom/base";
import helpCommand, { HelpCommandHelpers } from "../../../src/commands/utility/help";

describe("Testing help command", () => {
    // mocking Discord.Message
    const interaction: any = {
        reply: jest.fn(),
        member: {
            permissions: {
                has: jest.fn(),
            },
        },
    };

    const prefix = "/";

    // use the sample commands defined in the setup
    const commands: Collection<string, Command> = global["testCommands"];
    const commandGroups: Collection<string, string[]> = global["testCommandGroups"];

    // snapshots
    const helpAllMessageSnapshot = [
        `To run a command, use \`${prefix}command\` in any text channel provided on the server.`,
        `Use \`${prefix}help <command>\` to view detailed information about a specific command.`,
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
        "**options:**",
        "`<key1>` argument description, default: `0`",
    ];

    const helpArgDescriptionSnapshot = {
        argDetails: ["`<key1>` option description"],
        usageOptions: "<key1> ",
    };
    const helpCommandNotFoundMessageSnapshot = [
        "Unable to identify this command. Use the help " +
            "command to see a list of all the available commands.",
    ];

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        // Reset commands back to enabled
        commands.forEach((command) => {
            // eslint-disable-next-line no-param-reassign
            command.enabled = true;
        });
    });

    describe("Testing helper functions", () => {
        it("Should capitalize the string", () => {
            const s = "test";
            const result = HelpCommandHelpers.capitalize(s);
            expect(result).toBe("Test");
        });

        it("Should not capitalize an empty string", () => {
            const s = "";
            const result = HelpCommandHelpers.capitalize(s);
            expect(result).toBe(s);
        });

        it("Should make detailed argument description object from options", () => {
            const sampleCommand = commands.get("sample");
            const result = HelpCommandHelpers.makeArgDescriptions(sampleCommand.options);
            expect(result).toEqual(helpArgDescriptionSnapshot);
        });

        it("Should make a help all message", () => {
            const result = HelpCommandHelpers.makeHelpAllMessage(
                prefix,
                commands,
                commandGroups
            );
            expect(result).toEqual(helpAllMessageSnapshot);
            expect(result.join(" ").includes("Available commands")).toBe(true);
        });

        it("Should make a help message for the sample command containing the usage and description", () => {
            const result = HelpCommandHelpers.makeSpecificHelpMessage(
                commands.get("sample")
            );
            expect(result.join(" ").includes("Usage")).toBe(true);
            expect(result.join(" ").includes(commands.get("sample").description)).toBe(
                true
            );
        });

        it("Should make a help message with sample crossed out when disabled in help all message", async () => {
            commands.get("sample").enabled = false;

            const result = HelpCommandHelpers.makeHelpAllMessage(
                prefix,
                commands,
                commandGroups
            );
            expect(result.join(" ").includes("~~**sample")).toBe(true); // ~~**word~~ is the way to cross out a bolded word
        });

        it("should make a help message for the sample command with additional help info if specified", async () => {
            const sampleCommand = commands.get("sample")!;
            sampleCommand.additionalHelpInfo = ["Sample Additional Info"];
            commands.set("sample", sampleCommand);

            const result = HelpCommandHelpers.makeSpecificHelpMessage(
                commands.get("sample")
            );
            expect(
                result
                    .join(" ")
                    .includes(commands.get("sample").additionalHelpInfo.join(" "))
            ).toBe(true);
        });

        it("Should say this command is currently disabled when disabled in specific help message", async () => {
            commands.get("sample").enabled = false;

            const result = HelpCommandHelpers.makeSpecificHelpMessage(
                commands.get("sample")
            );
            expect(result.join(" ").includes("disabled")).toBe(true);
        });
    });

    describe("Testing help command's run function", () => {
        it("should send a summary of all the commands", async () => {
            const spy = jest.spyOn(HelpCommandHelpers, "makeHelpAllMessage");
            const interactionSpy = jest.spyOn(interaction, "reply");

            const options = {
                command: null, // nothing passed in for 'command' argument
            };
            await helpCommand.run(interaction, options, commands, commandGroups);

            expect(spy).toHaveBeenCalledTimes(1);
            expect(interactionSpy).toHaveBeenCalledTimes(1);
        });

        it("should send a detailed description of the sample command", async () => {
            const spy = jest.spyOn(HelpCommandHelpers, "makeSpecificHelpMessage");
            const interactionSpy = jest.spyOn(interaction, "reply");

            const options = {
                command: "sample",
            };
            await helpCommand.run(interaction, options, commands, commandGroups);

            expect(spy).toHaveBeenCalledTimes(1);
            expect(interactionSpy).toHaveBeenCalledTimes(1);
        });

        it("should send a detailed description of the help command", async () => {
            const spy = jest.spyOn(HelpCommandHelpers, "makeSpecificHelpMessage");
            const interactionSpy = jest.spyOn(interaction, "reply");

            const options = {
                command: "help",
            };
            await helpCommand.run(interaction, options, commands, commandGroups);

            expect(spy).toHaveBeenCalledTimes(1);
            expect(interactionSpy).toHaveBeenCalledTimes(1);
        });

        it("should send an error message if not a valid command", async () => {
            const interactionSpy = jest.spyOn(interaction, "reply");

            const options = {
                command: "unknown",
            };
            await helpCommand.run(interaction, options, commands, commandGroups);

            expect(interactionSpy).toHaveBeenCalledWith({
                content: [
                    "Unable to identify unknown command. Use the help " +
                        "command to see a list of all the available commands.",
                ].join("\n"),
                ephemeral: true,
            });
        });
    });
});
