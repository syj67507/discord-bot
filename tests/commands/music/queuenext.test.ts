import queuenextCommand from "../../../src/commands/music/queuenext";
import queueCommand from "../../../src/commands/music/queue";
import { ArgumentValues, parseArgs } from "../../../src/custom/base";
import "dotenv/config";

describe("QueueNext Command Tests", () => {
    const message = {
        content: process.env.PREFIX! + "queuenext Test title",
        reply: () => {
            return;
        },
    } as any;

    beforeEach(() => {
        jest.restoreAllMocks();
        jest.spyOn(queueCommand, "run").mockImplementation(async () => {
            return null;
        });
    });

    it("should call the queue command internally with the position parameter set at the beginning", async () => {
        const args: ArgumentValues = await parseArgs(
            message.content.split(/[ ]+/).slice(1),
            queueCommand.arguments,
            {} as any
        );

        const queuenextCommandRunSpy = jest.spyOn(queuenextCommand, "run");

        await queuenextCommand.run(message, args);
        expect(
            queuenextCommandRunSpy.mock.calls[0][0].content.includes("--position 1")
        ).toBe(true);
    });
});
