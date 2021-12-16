import meowCommand from "../../../src/commands/misc/meow";

describe("Testing the meow command", () => {
    describe("Testing the meow command's run function", () => {
        // Marked as any for avoiding parameter checks in run()
        const interaction: any = {
            reply: jest.fn(),
        };
        it("should respond with meow", async () => {
            const interactionSpy = jest.spyOn(interaction, "reply");

            const options: any = {};
            const result = await meowCommand.run(interaction, options);

            expect(result).toBeNull();
            expect(interactionSpy).toHaveBeenCalledTimes(1);
            expect(interactionSpy).toHaveBeenLastCalledWith("Meow!");
        });
    });
});
