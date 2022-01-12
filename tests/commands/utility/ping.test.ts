import pingCommand from "../../../src/commands/utility/ping";

describe("Testing ping command", () => {
    const interaction: any = {
        reply: jest.fn(),
    };

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should be true", async () => {
        const interactionSpy = jest.spyOn(interaction, "reply");
        await pingCommand.run(interaction, {}, {} as any, {} as any);
        expect(interactionSpy).toBeCalledTimes(1);
    });
});
