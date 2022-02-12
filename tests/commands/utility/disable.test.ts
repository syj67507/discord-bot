import { Collection } from "discord.js";
import disableCommand from "../../../src/commands/utility/disable";
import { Command } from "../../../src/custom/base";

describe("Testing utility/disable command", () => {
    const interaction = global["interaction"];
    const applicationCommand = global["applicationCommand"];

    const commands: Collection<string, Command> = global["testCommands"];
    const commandGroups: Collection<string, string[]> = global["testCommandGroups"];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        // Start with the commands enabled
        commands.get("sample")!.enabled = true;
        jest.spyOn(applicationCommand.permissions, "has").mockReturnValue(false);

        // default behavior in tests for user to have ADMINISTRATOR permissions
        jest.spyOn(interaction.member.permissions, "has").mockReturnValue(true);
    });

    it("should disable the sample command", async () => {
        expect(commands.get("sample")!.enabled).toBe(true);

        const options = {
            command: "sample",
        };
        await disableCommand.run(interaction, options, commands, commandGroups);

        expect(commands.get("sample")!.enabled).toBe(false);
    });

    it("should not disable because no adminstrator privileges", async () => {
        expect(commands.get("sample")!.enabled).toBe(true);

        const replySpy = jest.spyOn(interaction, "reply");
        jest.spyOn(interaction.member.permissions, "has").mockImplementation(() => false);

        const options = {
            command: "sample",
        };
        await disableCommand.run(interaction, options, commands, commandGroups);

        expect(commands.get("sample")!.enabled).toBe(true);
        expect(replySpy.mock.calls[0][0] as string).toBe(
            "You do not have permissions to disable commands."
        );
    });

    it("should not disable the sample command because command doesn't exist", async () => {
        expect(commands.get("sample")!.enabled).toBe(true);

        const replySpy = jest.spyOn(interaction, "reply");

        const options = {
            command: "unknown",
        };
        await disableCommand.run(interaction, options, commands, commandGroups);

        expect(commands.get("sample")!.enabled).toBe(true);
        expect(
            (replySpy.mock.calls[0][0] as string).includes("`unknown` not found.")
        ).toBeTruthy();
    });

    it("should not disable a utility command", async () => {
        expect(commands.get("sampleUtility")!.enabled).toBe(true);

        const replySpy = jest.spyOn(interaction, "reply");

        const options = {
            command: "sampleUtility",
        };
        await disableCommand.run(interaction, options, commands, commandGroups);

        expect(commands.get("sampleUtility")!.enabled).toBe(true);
        expect(replySpy).toHaveBeenLastCalledWith("Can't disable a utility command.");
    });

    it("should not disable if sample is already disabled", async () => {
        commands.get("sample")!.enabled = false;
        expect(commands.get("sample")!.enabled).toBe(false);

        const replySpy = jest.spyOn(interaction, "reply");
        jest.spyOn(applicationCommand.permissions, "has").mockReturnValue(true);

        const options = {
            command: "sample",
        };
        await disableCommand.run(interaction, options, commands, commandGroups);

        expect(commands.get("sample")!.enabled).toBe(false);
        expect(replySpy).toHaveBeenLastCalledWith("`sample` is already disabled.");
    });

    it("should disable if the ApplicationCommand data is in the cache", async () => {
        expect(commands.get("sample")!.enabled).toBe(true);

        jest.spyOn(interaction.guild.commands.cache, "find").mockReturnValue(
            applicationCommand
        );

        const options = {
            command: "sample",
        };
        await disableCommand.run(interaction, options, commands, commandGroups);

        expect(commands.get("sample")!.enabled).toBe(false);
    });
});
