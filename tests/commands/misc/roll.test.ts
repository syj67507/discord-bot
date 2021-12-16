import rollCommand from "../../../src/commands/misc/roll";

describe("Testing vibecheckCommand", () => {
    describe("Testing the vibecheck's run function", () => {
        // Marked as any for avoiding parameter checks in run()
        const interaction: any = {
            reply: jest.fn(),
        };
        const emote = "(~‾▿‾)~";

        it("should reply with the calculated number 1-19 without the emote", async () => {
            for (let i = 0; i < 20; i += 1) {
                // mock the Math.random function
                jest.spyOn(global.Math, "random").mockImplementation(() => i / 20);
                const messageSpy = jest.spyOn(interaction, "reply");

                const options: any = {};
                const result = await rollCommand.run(interaction, options);

                expect(result).toBeNull();
                expect(messageSpy).toHaveBeenLastCalledWith(`${i}`);

                const parameter: any = messageSpy.mock.calls[i][0]; // parameter passed into message.reply
                expect(parameter.endsWith(emote)).toBe(false);
            }
        });

        it("should reply with the calculated number 1-19 without the emote", async () => {
            // mock the Math.random function
            jest.spyOn(global.Math, "random").mockImplementation(() => 0.99);
            const messageSpy = jest.spyOn(interaction, "reply");

            const options: any = {};
            const result = await rollCommand.run(interaction, options);
            expect(result).toBeNull();
            expect(messageSpy).toHaveBeenLastCalledWith("20 (~‾▿‾)~");
        });
    });
});
