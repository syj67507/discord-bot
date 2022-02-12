import { Collection } from "discord.js";
import enableCommand from "../../../src/commands/utility/enable";
import { Command } from "../../../src/custom/base";

describe("Testing utility/enable command", () => {
    const interaction = global["interaction"];
    const applicationCommand = global["applicationCommand"];

    const commands: Collection<string, Command> = global["testCommands"];
    const commandGroups: Collection<string, string[]> = global["testCommandGroups"];

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        // Start with the commands already disabled
        commands.get("sample")!.enabled = false;
        jest.spyOn(applicationCommand.permissions, "has").mockReturnValue(true);

        // default behavior in tests for user to have ADMINISTRATOR permissions
        jest.spyOn(interaction.member.permissions, "has").mockReturnValue(true);
    });

    it("should enable the sample command", async () => {
        expect(commands.get("sample")!.enabled).toBe(false);

        const options = {
            command: "sample",
        };
        await enableCommand.run(interaction, options, commands, commandGroups);

        expect(commands.get("sample")!.enabled).toBe(true);
    });

    it("should not enable because no adminstrator privileges", async () => {
        expect(commands.get("sample")!.enabled).toBe(false);

        jest.spyOn(interaction.member.permissions, "has").mockReturnValue(false);
        const interactionReplySpy = jest.spyOn(interaction, "reply");

        const options = {
            command: "sample",
        };
        await enableCommand.run(interaction, options, commands, commandGroups);

        expect(commands.get("sample")!.enabled).toBe(false);
        expect(interactionReplySpy).toHaveBeenCalledWith(
            "You do not have permissions to enable commands."
        );
    });

    it("should not enable the unknown command because command doesn't exist", async () => {
        const interactionReplySpy = jest.spyOn(interaction, "reply");

        const options = {
            command: "unknown",
        };
        await enableCommand.run(interaction, options, commands, commandGroups);

        expect(commands.get("sample")!.enabled).toBe(false);
        expect(interactionReplySpy).toHaveBeenLastCalledWith(
            "Unable to enable: `unknown` not found."
        );
    });

    it("should not enable if sample is already enabled", async () => {
        commands.get("sample")!.enabled = true; // mark as enabled
        expect(commands.get("sample")!.enabled).toBe(true);

        const interactionReplySpy = jest.spyOn(interaction, "reply");
        // Mocking this applicationCommands permission to not have the disable restriction
        jest.spyOn(applicationCommand.permissions, "has").mockReturnValue(false);

        const options = {
            command: "sample",
        };
        await enableCommand.run(interaction, options, commands, commandGroups);

        expect(commands.get("sample")!.enabled).toBe(true);
        expect(interactionReplySpy).toHaveBeenLastCalledWith(
            "`sample` is already enabled."
        );
    });

    it("should enable if the ApplicationCommand data is in the cache", async () => {
        expect(commands.get("sample")!.enabled).toBe(false);

        jest.spyOn(interaction.guild.commands.cache, "find").mockReturnValue(
            applicationCommand
        );

        const options = {
            command: "sample",
        };
        await enableCommand.run(interaction, options, commands, commandGroups);

        expect(commands.get("sample")!.enabled).toBe(true);
    });
});
