import jokeCommand from "../../../src/commands/misc/joke";
import axios from "axios";

describe("Testing the joke command", () => {
    describe("Testing the joke command's run function", () => {
        const interaction: any = {
            reply: jest.fn(),
        };
        const mockedJoke = "This is a mocked joke.";
        beforeEach(() => {
            jest.restoreAllMocks();
            jest.spyOn(axios, "get").mockImplementation(async () => {
                return {
                    data: {
                        attachments: [
                            {
                                text: mockedJoke,
                            },
                        ],
                    },
                };
            });
        });

        it("Should reply with a joke with the :rofl: emoji", async () => {
            const interactionSpy = jest.spyOn(interaction, "reply");
            jest.spyOn(global.Math, "random").mockImplementation(() => 0.1);

            const options = {};

            await jokeCommand.run(interaction, options);

            expect(interactionSpy).toHaveBeenLastCalledWith(
                "This is a mocked joke. :rofl:"
            );
        });

        it("Should reply with a joke with the :joy: emoji", async () => {
            const interactionSpy = jest.spyOn(interaction, "reply");
            jest.spyOn(global.Math, "random").mockImplementation(() => 0.6);

            const options = {};

            await jokeCommand.run(interaction, options);

            expect(interactionSpy).toHaveBeenLastCalledWith(
                "This is a mocked joke. :joy:"
            );
        });
    });
});
