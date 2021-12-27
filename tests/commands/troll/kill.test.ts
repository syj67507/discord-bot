import killCommand from "../../../src/commands/troll/kill";
import { KillIntervals } from "../../../src/custom/storage";
// LOOK INTO USING GLOBAL INSTEAD OF TIMERS
import timers from "timers";
// global.setInterval();
// setInterval(() => {}, 1);
describe("Kill Command Tests", () => {
    const memberMock = {
        id: "targetId",
        roles: {
            highest: "value",
        },
        voice: {
            channel: {
                name: "channelName",
            },
            setChannel: jest.fn(),
        },
        user: {
            tag: "tag",
        },
    };

    const interaction: any = {
        channel: {
            send: jest.fn(),
        },
        reply: jest.fn(),
        member: {
            roles: {
                highest: {
                    comparePositionTo: jest.fn(),
                },
            },
        },
    };

    const killIntervals = KillIntervals.getInstance();

    beforeEach(() => {
        jest.useFakeTimers();
        jest.restoreAllMocks();

        // Mock the timers
        jest.spyOn(timers, "setInterval").mockImplementation(jest.fn());

        // Clear the kill intervals database before each test
        killIntervals.clear();

        // Default behavior will be making the user have higher permissions than the target
        jest.spyOn(
            interaction.member.roles.highest,
            "comparePositionTo"
        ).mockImplementation(() => {
            return 1;
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("The kill interval should be set with an interval of one second", async () => {
        const setIntervalSpy = jest.spyOn(timers, "setInterval");

        expect(killIntervals.size).toBe(0);

        const options = {
            member: memberMock,
            interval: 5,
        };
        await killCommand.run(interaction, options, {} as any, {} as any);

        // jest.advanceTimersByTime(2000);

        expect(killIntervals.size).toBe(1);
        expect(setIntervalSpy).toHaveBeenCalled();
        expect(setIntervalSpy.mock.calls[0][1]).toBe(5000);
    });

    it("The kill interval should not be set if the user does not have higher permissions than the target", async () => {
        jest.useFakeTimers();
        // User will have lower permissions than the target
        jest.spyOn(
            interaction.member.roles.highest,
            "comparePositionTo"
        ).mockImplementation(() => {
            return -1;
        });

        expect(killIntervals.size).toBe(0);

        const options = {
            member: memberMock,
            interval: 10,
        };
        await killCommand.run(interaction, options, {} as any, {} as any);

        expect(killIntervals.size).toBe(0);
        jest.useRealTimers();
    });

    // it("The kill interval should be set with a 5 second interval if an interval was not given", async () => {
    //     const setIntervalSpy = jest.spyOn(timers, "setInterval");

    //     expect(killIntervals.size).toBe(0);

    //     const options = {
    //         member: memberMock,
    //     };
    //     await killCommand.run(interaction, options, {} as any, {} as any);

    //     expect(killIntervals.size).toBe(1);
    //     expect(setIntervalSpy).toHaveBeenCalled();
    //     expect(setIntervalSpy.mock.calls[0][1]).toBe(5000);
    // });

    // it("The kill interval should replace the existing interval if one is already set", async () => {
    //     const setIntervalSpy = jest.spyOn(timers, "setInterval");
    //     const intervalsDeleteSpy = jest.spyOn(killIntervals, "delete");
    //     const clearIntervalSpy = jest.spyOn(timers, "clearInterval");

    //     const options = {
    //         member: memberMock,
    //     };
    //     await killCommand.run(interaction, options, {} as any, {} as any);
    //     setIntervalSpy.mockClear();

    //     expect(killIntervals.size).toBe(1);

    //     await killCommand.run(interaction, options, {} as any, {} as any);

    //     expect(killIntervals.size).toBe(1);
    //     expect(intervalsDeleteSpy).toHaveBeenCalled();
    //     expect(setIntervalSpy).toHaveBeenCalled();
    //     expect(clearIntervalSpy).toHaveBeenCalled();
    //     expect(setIntervalSpy.mock.calls[0][1]).toBe(5000); // Second setInterval call should be checked here
    // });
});
