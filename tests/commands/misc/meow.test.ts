import meowCommand from "../../../v12_src/commands/misc/meow";

describe("Testing the meow command", () => {
    describe("Testing the meow command's run function", () => {
        // Marked as any for avoiding parameter checks in run()
        const message: any = {
            channel: {
                send: jest.fn(),
            },
        };
        it("should respond with meow", async () => {
            const messageSpy = jest.spyOn(message.channel, "send");
            const result = await meowCommand.run(message, {});

            expect(result).toBeNull();
            expect(messageSpy).toHaveBeenCalledTimes(1);
            expect(messageSpy).toHaveBeenLastCalledWith("Meow!");
        });
    });
});
