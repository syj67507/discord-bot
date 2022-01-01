import killCommand, { KillHelper } from "../../../src/commands/troll/kill";
import { KillIntervals } from "../../../src/custom/storage";
import { logger as log } from "../../../src/custom/logger";

describe("Kill Command Tests", () => {
    const memberMock: any = {
        id: "targetId",
        roles: {
            highest: "value",
        },
        voice: {
            channel: {
                name: "channelName",
            },
            setChannel: async () => jest.fn(),
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
        jest.clearAllTimers();
        jest.useFakeTimers();
        jest.restoreAllMocks();

        // Mocks
        jest.spyOn(global, "setInterval"); // .mockImplementation(jest.fn());
        jest.spyOn(log, "debug").mockImplementation(jest.fn());

        // Clear the kill intervals database before each test
        for (const key of killIntervals.keys()) {
            global.clearInterval(killIntervals.get(key)!);
        }
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

    describe("killCommand.run() tests", () => {
        beforeEach(() => {
            jest.spyOn(KillHelper, "kick").mockImplementation(jest.fn());
        });

        // IMPORTANT NOTE: This test case is run first due to some issue where the timers on subsequent tests aren't running from a clean slate.
        // I can't figure out why timers aren't being set after the first test properly. Code has been refactored to get around this issue.
        it("The kill interval should call the kick function when the interval time has been passed", async () => {
            const kickSpy = jest.spyOn(KillHelper, "kick");

            expect(killIntervals.size).toBe(0);

            const options = {
                member: memberMock,
            };
            await killCommand.run(interaction, options, {} as any, {} as any);
            jest.advanceTimersToNextTimer();

            expect(killIntervals.size).toBe(1);
            expect(kickSpy).toHaveBeenCalled();
        });

        it("The kill interval should be set with an interval of one second", async () => {
            const setIntervalSpy = jest.spyOn(global, "setInterval");

            expect(killIntervals.size).toBe(0);

            const options = {
                member: memberMock,
                interval: 1,
            };
            await killCommand.run(interaction, options, {} as any, {} as any);

            expect(killIntervals.size).toBe(1);
            expect(setIntervalSpy).toHaveBeenCalled();
            expect(setIntervalSpy.mock.calls[0][1]).toBe(1000);
        });

        it("The kill interval should not be set if the user does not have higher permissions than the target", async () => {
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
        });

        it("The kill interval should be set with a default of 5 seconds if an interval was not given", async () => {
            const setIntervalSpy = jest.spyOn(global, "setInterval");

            expect(killIntervals.size).toBe(0);

            const options = {
                member: memberMock,
            };
            await killCommand.run(interaction, options, {} as any, {} as any);

            expect(killIntervals.size).toBe(1);
            expect(setIntervalSpy).toHaveBeenCalled();
            expect(setIntervalSpy.mock.calls[0][1]).toBe(5000);
        });

        it("The kill interval should replace the existing interval if one is already set", async () => {
            const setIntervalSpy = jest.spyOn(global, "setInterval");
            const clearIntervalSpy = jest.spyOn(global, "clearInterval");
            const intervalsDeleteSpy = jest.spyOn(killIntervals, "delete");

            // Setting an interval
            const options = {
                member: memberMock,
            };
            await killCommand.run(interaction, options, {} as any, {} as any);
            setIntervalSpy.mockClear();

            // Testing if it can be cleared and replaced
            expect(killIntervals.size).toBe(1);

            await killCommand.run(interaction, options, {} as any, {} as any);

            expect(killIntervals.size).toBe(1);
            expect(intervalsDeleteSpy).toHaveBeenCalled();
            expect(setIntervalSpy).toHaveBeenCalled();
            expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
            expect(setIntervalSpy.mock.calls[0][1]).toBe(5000); // Second setInterval call should be checked here
        });
    });

    describe("KillHelper tests", () => {
        it("should do nothing if the target is not currently in a voice channel", async () => {
            // set target's voice channel to null for this test
            const og = { ...memberMock.voice.channel };
            memberMock.voice.channel = null;

            const setChannelSpy = jest.spyOn(memberMock.voice, "setChannel");

            await KillHelper.kick(interaction, memberMock, killIntervals);

            expect(memberMock.voice.channel).toBeNull();
            expect(setChannelSpy).not.toHaveBeenCalled();

            // return back to normal
            memberMock.voice.channel = { ...og };
        });

        it("should kick the target if they are currently in a voice channel and the interval should not be cleared", async () => {
            const setChannelSpy = jest.spyOn(memberMock.voice, "setChannel");
            const clearIntervalSpy = jest.spyOn(global, "clearInterval");

            await KillHelper.kick(interaction, memberMock, killIntervals);

            expect(setChannelSpy).toHaveBeenCalled();
            expect(clearIntervalSpy).not.toHaveBeenCalled();
        });

        it("should clear the interval if the target was attempted to be kicked but the call failed", async () => {
            const setChannelSpy = jest
                .spyOn(memberMock.voice, "setChannel")
                .mockImplementation(async () => {
                    throw new Error();
                });
            const clearIntervalSpy = jest.spyOn(global, "clearInterval");

            await KillHelper.kick(interaction, memberMock, killIntervals);

            expect(setChannelSpy).toHaveBeenCalled();
            expect(clearIntervalSpy).toHaveBeenCalled();
        });
    });
});
