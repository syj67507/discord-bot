import { Collection } from "discord.js";
import { Command } from "../../../v12_src/custom/base";

describe("Testing utility/disable command", () => {
    // mocking Discord.Message
    const message: any = {
        content: "",
        channel: {
            send: jest.fn(),
        },
        reply: jest.fn(),
        member: {
            permissions: {
                has(perm: any): boolean {
                    return perm === "ADMINISTRATOR";
                },
            },
        },
    };

    // reimport modules before each test to reset the loaded command definitions before each test
    let commands: Collection<string, Command>;
    let commandAliases: Collection<string, string>;
    let commandGroups: Collection<string, string[]>;
    let disableCommand: Command;

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.restoreAllMocks();

        jest.mock("../../../v12_src/index");
        jest.resetModules(); // future imports of the same module will be replaced with the new instance on the import call

        const loadedCommands = await import("../../../v12_src/index");
        commands = loadedCommands.commands;
        commandAliases = loadedCommands.commandAliases;
        commandGroups = loadedCommands.commandGroups;
        disableCommand = (await import("../../../v12_src/commands/utility/disable"))
            .default;
    });

    it("should disable the sample command", async () => {
        expect(commands.get("sample")!.enabled).toBe(true);

        const permissionsSpy = jest.spyOn(message.member.permissions, "has");

        const args = {
            command: "sample",
        };
        await disableCommand.run(message, args);

        expect(commands.get("sample")!.enabled).toBe(false);
        expect(permissionsSpy).toHaveBeenCalledTimes(1);
        expect(permissionsSpy).toHaveLastReturnedWith(true);
    });

    it("should not disable because no adminstrator privileges", async () => {
        expect(commands.get("sample")!.enabled).toBe(true);

        const messageReplySpy = jest.spyOn(message, "reply");
        const permissionsSpy = jest.spyOn(message.member.permissions, "has");
        permissionsSpy.mockImplementation(() => false);

        const args = {
            command: "sample",
        };
        await disableCommand.run(message, args);

        expect(commands.get("sample")!.enabled).toBe(true);
        expect(permissionsSpy).toHaveBeenCalledTimes(1);
        expect(permissionsSpy).toHaveLastReturnedWith(false);
        expect(messageReplySpy).toHaveBeenCalledWith(
            "You do not have permissions to disable commands."
        );
    });

    it("should not disable the sample command because command doesn't exist", async () => {
        expect(commands.get("sample")!.enabled).toBe(true);

        const commandAliasesSpy = jest.spyOn(commandAliases, "has");
        const messageReplySpy = jest.spyOn(message, "reply");
        commandAliases.delete("sample");

        const args = {
            command: "sample",
        };
        await disableCommand.run(message, args);

        expect(commands.get("sample")!.enabled).toBe(true);
        expect(commandAliasesSpy).toHaveLastReturnedWith(false);
        expect(messageReplySpy).toHaveBeenLastCalledWith(
            "Unable to disable: `sample` not found."
        );
    });

    it("should not disable the sample utility command", async () => {
        expect(commands.get("sampleUtility")!.enabled).toBe(true);
        expect(commandGroups.get("utility")!.includes("sampleUtility"));

        const messageReplySpy = jest.spyOn(message, "reply");

        const args = {
            command: "sampleUtility",
        };
        await disableCommand.run(message, args);

        expect(commands.get("sampleUtility")!.enabled).toBe(true);
        expect(messageReplySpy).toHaveBeenLastCalledWith(
            "Can't disable a utility command."
        );
    });

    it("should not disable if sample is already disabled", async () => {
        commands.get("sample")!.enabled = false;
        expect(commands.get("sample")!.enabled).toBe(false);

        const messageReplySpy = jest.spyOn(message, "reply");

        const args = {
            command: "sample",
        };
        await disableCommand.run(message, args);

        expect(commands.get("sample")!.enabled).toBe(false);
        expect(messageReplySpy).toHaveBeenLastCalledWith("`sample` is already disabled.");
    });
});
