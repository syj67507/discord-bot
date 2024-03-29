import { Collection } from "discord.js";
import { Command } from "../../../v12_src/custom/base";

describe("Testing utility/enable command", () => {
    // mocking Discord.Message
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
    };

    // reimport modules before each test to reset the loaded command definitions before each test
    let commands: Collection<string, Command>;
    let commandAliases: Collection<string, string>;
    let enableCommand: Command;

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        jest.mock("../../../v12_src/index");
        jest.resetModules(); // future imports of the same module will be replaced with the new instance on the import call

        const loadedCommands = await import("../../../v12_src/index");
        commands = loadedCommands.commands;
        commandAliases = loadedCommands.commandAliases;
        enableCommand = (await import("../../../v12_src/commands/utility/enable"))
            .default;

        // Start with the commands already disabled
        commands.get("sample")!.enabled = false;
    });

    it("should enable the sample command", async () => {
        expect(commands.get("sample")!.enabled).toBe(false);

        const args = {
            command: "sample",
        };
        await enableCommand.run(message, args);

        expect(commands.get("sample")!.enabled).toBe(true);
    });

    it("should not enable because no adminstrator privileges", async () => {
        expect(commands.get("sample")!.enabled).toBe(false);

        const messageReplySpy = jest.spyOn(message, "reply");
        const permissionsSpy = jest.spyOn(message.member.permissions, "has");
        permissionsSpy.mockImplementation(() => false);

        const args = {
            command: "sample",
        };
        await enableCommand.run(message, args);

        expect(commands.get("sample")!.enabled).toBe(false);
        expect(permissionsSpy).toHaveBeenCalledTimes(1);
        expect(permissionsSpy).toHaveLastReturnedWith(false);
        expect(messageReplySpy).toHaveBeenCalledWith(
            "You do not have permissions to enable commands."
        );
    });

    it("should not enable the sample command because command doesn't exist", async () => {
        expect(commands.get("sample")!.enabled).toBe(false);

        const commandAliasesSpy = jest.spyOn(commandAliases, "has");
        const messageReplySpy = jest.spyOn(message, "reply");
        commandAliases.delete("sample");

        const args = {
            command: "sample",
        };
        await enableCommand.run(message, args);

        expect(commands.get("sample")!.enabled).toBe(false);
        expect(commandAliasesSpy).toHaveLastReturnedWith(false);
        expect(messageReplySpy).toHaveBeenLastCalledWith(
            "Unable to enable: `sample` not found."
        );
    });

    it("should not enable if sample is already enabled", async () => {
        commands.get("sample")!.enabled = true;
        expect(commands.get("sample")!.enabled).toBe(true);

        const messageReplySpy = jest.spyOn(message, "reply");

        const args = {
            command: "sample",
        };
        await enableCommand.run(message, args);

        expect(commands.get("sample")!.enabled).toBe(true);
        expect(messageReplySpy).toHaveBeenLastCalledWith("`sample` is already enabled.");
    });
});
