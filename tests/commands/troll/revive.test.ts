import reviveCommand from "../../../src/commands/troll/revive";
import { KillIntervals } from "../../../src/custom/storage";

describe("Revive Command tests", () => {
    const invoker: any = {
        id: "invokerId",
    };

    const target: any = {
        id: "targetId",
    };

    const interaction: any = {
        member: invoker,
        reply: jest.fn(),
    };

    const killIntervals = KillIntervals.getInstance();

    beforeEach(() => {
        jest.restoreAllMocks();
        killIntervals.clear();

        killIntervals.set("targetId", {} as any);
    });

    it("should clear the interval to revive the target if the target and invoker are different people", async () => {
        expect(killIntervals.size).toBe(1);

        const clearIntervalSpy = jest.spyOn(global, "clearInterval");
        const options = {
            user: target,
        };
        await reviveCommand.run(interaction, options, {} as any, {} as any);

        expect(clearIntervalSpy).toHaveBeenCalled();
        expect(killIntervals.size).toBe(0);
    });

    it("should not clear the interval if the target is not being killed", async () => {
        expect(killIntervals.size).toBe(1);

        const clearIntervalSpy = jest.spyOn(global, "clearInterval");
        const options = {
            user: { id: "notAKilledTargetId" },
        };
        await reviveCommand.run(interaction, options, {} as any, {} as any);

        expect(clearIntervalSpy).not.toHaveBeenCalled();
        expect(killIntervals.size).toBe(1);
    });

    it("should not clear the interval if the invoker is not an owner tries to revive themselves", async () => {
        expect(killIntervals.size).toBe(1);

        const clearIntervalSpy = jest.spyOn(global, "clearInterval");
        const options = {
            user: invoker,
        };
        await reviveCommand.run(interaction, options, {} as any, {} as any);

        expect(clearIntervalSpy).not.toHaveBeenCalled();
        expect(killIntervals.size).toBe(1);
    });

    it("should clear the interval if the invoker is an owner tries to revive themselves", async () => {
        // Owner of client has a specific id
        const owner = {
            id: "108726505688862720",
        };
        killIntervals.set(owner.id, {} as any);

        const clearIntervalSpy = jest.spyOn(global, "clearInterval");

        // Setting up custom interaction and options with owner as the member
        const ownerInteraction: any = {
            ...interaction,
            member: owner,
        };
        const options = {
            user: owner,
        };
        await reviveCommand.run(ownerInteraction, options, {} as any, {} as any);

        expect(clearIntervalSpy).toHaveBeenCalled();
        expect(killIntervals.has(owner.id)).toBeFalsy();
    });
});
