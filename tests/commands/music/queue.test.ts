import MusicManager, { Track } from "../../../src/custom/music-manager";
import queueCommand from "../../../src/commands/music/queue";
import { ArgumentValues, parseArgs } from "../../../src/custom/base";
import "dotenv/config";
import { YTClient } from "../../../src/custom/ytclient";

describe("Queue command tests", () => {
    /**
     * All tests will be setup with the following conditions
     *
     * - YTClient calls are all mocked to return a specific Track object
     * - The default behavior of YTClient calls will be defaulting to search calls
     * - MusicManager voice related functions are mocked with an empty function
     * - A 'track' object has been defined for all test that are expected to queue (used in mocks)
     *
     */

    let mm: MusicManager;
    let message: any;
    let mmQueueSpy: jest.SpyInstance;
    let ytClientSearchSpy: jest.SpyInstance;
    let ytClientGetPlaylistSpy: jest.SpyInstance;
    let ytClientGetVideoSpy: jest.SpyInstance;
    let track: Track;

    beforeAll(() => {
        const client: any = {
            on: jest.fn(),
        };
        mm = MusicManager.getInstance(client);
    });

    beforeEach(() => {
        jest.restoreAllMocks();

        message = {
            content: process.env.PREFIX! + "queue asdfa",
            reply: jest.fn(),
        };

        jest.spyOn(MusicManager, "getInstance").mockImplementation(() => mm);
        jest.spyOn(mm, "connect").mockImplementation(jest.fn());
        jest.spyOn(mm, "disconnect").mockImplementation(jest.fn());
        jest.spyOn(mm, "play").mockImplementation(jest.fn());
        mmQueueSpy = jest.spyOn(mm, "queue");
        mm.clearQueue();

        track = {
            title: "Test title",
            link: "youtube.link",
            duration: "2:30",
        };
        ytClientSearchSpy = jest
            .spyOn(YTClient.prototype, "search")
            .mockImplementation(async () => track);
        ytClientGetPlaylistSpy = jest
            .spyOn(YTClient.prototype, "getPlaylist")
            .mockImplementation(async () => {
                throw new Error();
            });
        ytClientGetVideoSpy = jest
            .spyOn(YTClient.prototype, "getVideo")
            .mockImplementation(async () => {
                throw new Error();
            });
    });

    it("queueCommand should add a track to the end of the queue from a YouTube search", async () => {
        mm.queue({
            title: "Previous title",
            link: "previous.link",
            duration: "4:20",
        });
        mmQueueSpy.mockClear();

        message.content = process.env.PREFIX! + "queue Test title";
        const args: ArgumentValues = await parseArgs(
            message.content.split(/[ ]+/).slice(1),
            queueCommand.arguments,
            {} as any
        );

        expect(mm.queueLength()).toBe(1);

        await queueCommand.run(message, args);

        expect(mmQueueSpy).toHaveBeenCalledTimes(1);
        expect(mm.queueLength()).toBe(2);
        expect(mm.playlist[1]).toEqual(track);
    });

    it("queueCommand should add a track to the queue from a direct YouTube video link", async () => {
        message.content = process.env.PREFIX! + "queue youtube.link";
        const args: ArgumentValues = await parseArgs(
            message.content.split(/[ ]+/).slice(1),
            queueCommand.arguments,
            {} as any
        );

        ytClientGetVideoSpy = jest
            .spyOn(YTClient.prototype, "getVideo")
            .mockImplementation(async () => track);

        expect(mm.queueLength()).toBe(0);

        await queueCommand.run(message, args);

        expect(ytClientGetVideoSpy).toHaveBeenCalledTimes(1);
        expect(ytClientSearchSpy).not.toHaveBeenCalled();
        expect(mmQueueSpy).toHaveBeenCalledTimes(1);
        expect(mm.queueLength()).toBe(1);
    });

    it("queueCommand should add multiple tracks to the queue from a YouTube playlist", async () => {
        message.content = process.env.PREFIX! + "queue Test title --playlist";
        const args: ArgumentValues = await parseArgs(
            message.content.split(/[ ]+/).slice(1),
            queueCommand.arguments,
            {} as any
        );

        ytClientGetPlaylistSpy = jest
            .spyOn(YTClient.prototype, "getPlaylist")
            .mockImplementation(async () => [track, track, track]);

        expect(mm.queueLength()).toBe(0);

        await queueCommand.run(message, args);

        expect(ytClientGetPlaylistSpy).toHaveBeenCalledTimes(1);
        expect(ytClientGetVideoSpy).not.toHaveBeenCalled();
        expect(ytClientSearchSpy).not.toHaveBeenCalled();
        expect(mmQueueSpy).toHaveBeenCalledTimes(3);
        expect(mm.queueLength()).toBe(3);
    });

    it("queueCommand should attempt to display the queue if there are tracks in the queue", async () => {
        mm.queue(track);

        message.content = process.env.PREFIX! + "queue";
        const args: ArgumentValues = await parseArgs(
            message.content.split(/[ ]+/).slice(1),
            queueCommand.arguments,
            {} as any
        );

        const getQueuePreviewSpy = jest.spyOn(mm, "getQueuePreview");

        await queueCommand.run(message, args);

        expect(getQueuePreviewSpy).toHaveBeenCalledTimes(1);
        expect(mm.queueLength()).toBeGreaterThan(0);
    });

    it("queueCommand should send a message saying there are no tracks in queue to display", async () => {
        message.content = process.env.PREFIX! + "queue";
        const args: ArgumentValues = await parseArgs(
            message.content.split(/[ ]+/).slice(1),
            queueCommand.arguments,
            {} as any
        );

        const messageSpy = jest.spyOn(message, "reply");

        await queueCommand.run(message, args);

        expect(messageSpy.mock.calls[0][0]).toEqual("No tracks left in queue.");
        expect(mm.queueLength()).toBe(0);
    });

    it("queueCommand should clear the queue", async () => {
        mm.queue(track);

        message.content = process.env.PREFIX! + "queue clear";
        const args: ArgumentValues = await parseArgs(
            message.content.split(/[ ]+/).slice(1),
            queueCommand.arguments,
            {} as any
        );

        const clearQueueSpy = jest.spyOn(mm, "clearQueue");

        expect(mm.queueLength()).toBe(1);

        await queueCommand.run(message, args);

        expect(mm.queueLength()).toBe(0);
        expect(clearQueueSpy).toHaveBeenCalledTimes(1);
    });

    it("queueCommand should send an error message if the YTClient doesn't return any valid results", async () => {
        message.content = process.env.PREFIX! + "queue bad search title";
        const args: ArgumentValues = await parseArgs(
            message.content.split(/[ ]+/).slice(1),
            queueCommand.arguments,
            {} as any
        );

        ytClientGetVideoSpy = jest
            .spyOn(YTClient.prototype, "getVideo")
            .mockImplementation(async () => {
                throw new Error();
            });
        ytClientSearchSpy = jest
            .spyOn(YTClient.prototype, "search")
            .mockImplementation(async () => {
                throw new Error();
            });

        await queueCommand.run(message, args);

        expect(ytClientGetVideoSpy).toHaveBeenCalledTimes(1);
        expect(ytClientSearchSpy).toHaveBeenCalledTimes(1);
        expect(mmQueueSpy).not.toHaveBeenCalled();
        expect(mm.queueLength()).toBe(0);
    });

    it("queueCommand should send an error message if the YTClient doesn't return any valid playlist results", async () => {
        message.content = process.env.PREFIX! + "queue bad playlist --playlist";
        const args: ArgumentValues = await parseArgs(
            message.content.split(/[ ]+/).slice(1),
            queueCommand.arguments,
            {} as any
        );

        ytClientGetPlaylistSpy = jest
            .spyOn(YTClient.prototype, "getPlaylist")
            .mockImplementation(async () => {
                throw new Error();
            });

        await queueCommand.run(message, args);

        expect(ytClientGetPlaylistSpy).toHaveBeenCalledTimes(1);
        expect(ytClientGetVideoSpy).not.toHaveBeenCalled();
        expect(ytClientSearchSpy).not.toHaveBeenCalled();
        expect(mmQueueSpy).not.toHaveBeenCalled();
        expect(mm.queueLength()).toBe(0);
    });

    it("queueCommand should not display a message if called from the play command", async () => {
        mm.queue({
            title: "Previous title",
            link: "previous.link",
            duration: "4:20",
        });

        message.content = process.env.PREFIX! + "play Test title --position 123";
        const args: ArgumentValues = await parseArgs(
            message.content.split(/[ ]+/).slice(1),
            queueCommand.arguments,
            {} as any
        );

        const getQueuePreviewSpy = jest.spyOn(mm, "getQueuePreview");
        mmQueueSpy.mockClear();

        expect(mm.queueLength()).toBe(1);

        await queueCommand.run(message, args);

        expect(getQueuePreviewSpy).not.toHaveBeenCalled();
        expect(mmQueueSpy).toHaveBeenCalledTimes(1);
        expect(mmQueueSpy.mock.calls[0][1]).toBe(122); // position is offset by 1 to be zero based
        expect(mm.queueLength()).toBe(2);
    });

    it("queueCommand should send an error message if the position flag was not provided with a valid number parameter", async () => {
        message.content = process.env.PREFIX! + "queue Test title --position";
        const args: ArgumentValues = await parseArgs(
            message.content.split(/[ ]+/).slice(1),
            queueCommand.arguments,
            {} as any
        );

        expect(mm.queueLength()).toBe(0);

        await queueCommand.run(message, args);

        expect(mmQueueSpy).not.toHaveBeenCalled();
        expect(mm.queueLength()).toBe(0);
    });

    it("queueCommand should remove the positions flag and parameter if parsed successfully", async () => {
        message.content = process.env.PREFIX! + "queue Test position title --position 1";
        const args: ArgumentValues = await parseArgs(
            message.content.split(/[ ]+/).slice(1),
            queueCommand.arguments,
            {} as any
        );

        expect(mm.queueLength()).toBe(0);

        await queueCommand.run(message, args);

        expect(ytClientSearchSpy).toHaveBeenLastCalledWith("Test position title");
        expect(mmQueueSpy).toHaveBeenCalled();
        expect(mm.queueLength()).toBe(1);
    });
});
