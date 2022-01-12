import { Collection } from "discord.js";
import disableCommand from "../../../src/commands/utility/disable";

describe("Testing utility/disable command", () => {
    const command: any = {
        name: "sample",
        permissions: {
            has: () => false,
            set: jest.fn(),
        },
    };
    const commandsCollection: Collection<any, any> = new Collection();
    commandsCollection.set("sample", command);

    const rolesCache: Collection<any, any> = new Collection();
    rolesCache.set("everyoneRole", {
        name: "@everyone",
        id: "everyoneRoleId",
    });

    // mocking Discord.CommandInteraction
    const interaction: any = {
        reply: jest.fn(),
        member: {
            permissions: {
                has: () => true,
            },
        },
        guild: {
            roles: {
                cache: rolesCache,
            },
            commands: {
                cache: commandsCollection,
                fetch() {
                    return commandsCollection;
                },
            },
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it("should disable the sample command", async () => {
        const replySpy = jest.spyOn(interaction, "reply");

        const options = {
            command: "sample",
        };
        await disableCommand.run(
            interaction,
            options,
            global["commands"],
            global["commandGroups"]
        );

        expect(replySpy).toHaveBeenCalledTimes(1);
        expect(
            (replySpy.mock.calls[replySpy.mock.calls.length - 1][0] as string).endsWith(
                "disabled."
            )
        ).toBeTruthy();
    });

    it("should not disable because no adminstrator privileges", async () => {
        const replySpy = jest.spyOn(interaction, "reply");
        const permissionsSpy = jest.spyOn(interaction.member.permissions, "has");
        permissionsSpy.mockImplementation(() => false);

        const options = {
            command: "sample",
        };
        await disableCommand.run(
            interaction,
            options,
            global["commands"],
            global["commandGroups"]
        );

        expect(replySpy).toHaveBeenCalledTimes(1);
        expect(
            (replySpy.mock.calls[0][0] as string).endsWith("disabled.")
        ).not.toBeTruthy();
        expect(replySpy.mock.calls[0][0] as string).toBe(
            "You do not have permissions to disable commands."
        );
    });

    it("should not disable the sample command because command doesn't exist", async () => {
        const replySpy = jest.spyOn(interaction, "reply");

        const options = {
            command: "unknown",
        };
        await disableCommand.run(
            interaction,
            options,
            global["commands"],
            global["commandGroups"]
        );

        expect(replySpy).toHaveBeenCalledTimes(1);
        expect(
            (replySpy.mock.calls[0][0] as string).includes("disabled.")
        ).not.toBeTruthy();
        expect(
            (replySpy.mock.calls[0][0] as string).includes("`unknown` not found.")
        ).toBeTruthy();
    });

    it("should not disable the sample utility command", async () => {
        const replySpy = jest.spyOn(interaction, "reply");

        const options = {
            command: "sampleUtility",
        };
        await disableCommand.run(
            interaction,
            options,
            global["commands"],
            global["commandGroups"]
        );

        expect(replySpy).toHaveBeenCalledTimes(1);
        expect(replySpy).toHaveBeenLastCalledWith("Can't disable a utility command.");
    });

    it("should not disable if sample is already disabled", async () => {
        const replySpy = jest.spyOn(interaction, "reply");
        jest.spyOn(command.permissions, "has").mockReturnValue(true);

        const options = {
            command: "sample",
        };
        await disableCommand.run(
            interaction,
            options,
            global["commands"],
            global["commandGroups"]
        );

        expect(replySpy).toHaveBeenLastCalledWith("`sample` is already disabled.");
    });
});
