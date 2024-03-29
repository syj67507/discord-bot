import jokeCommand, { appendEmoji } from "../../../v12_src/commands/misc/joke";
import axios from "axios";

describe("Testing the joke command", () => {
    describe("Testing joke's helper functions", () => {
        beforeEach(() => {
            jest.restoreAllMocks();
        });

        it("should append the emoji :rofl:", () => {
            const joke = "This is the joke.";
            const emoji = " :rofl:";
            jest.spyOn(global.Math, "random").mockImplementation(() => 0.1);

            const result = appendEmoji(joke);

            expect(result).toBe(joke + emoji);
        });

        it("should append the emoji :joy:", () => {
            const joke = "This is the joke.";
            const emoji = " :joy:";
            jest.spyOn(global.Math, "random").mockImplementation(() => 0.9);

            const result = appendEmoji(joke);

            expect(result).toBe(joke + emoji);
        });
    });

    describe("Testing the joke command's run function", () => {
        const message: any = {
            reply: jest.fn(),
        };
        beforeEach(() => {
            jest.mock("axios");
            jest.restoreAllMocks();
        });

        it("Should run the run function", async () => {
            jest.spyOn(axios, "get").mockImplementation(async () => {
                return {
                    data: {
                        attachments: [
                            {
                                text: "This is a mocked joke.",
                            },
                        ],
                    },
                };
            });
            const messageSpy = jest.spyOn(message, "reply");
            jest.spyOn(global.Math, "random").mockImplementation(() => 0.1);
            const args = {};
            const result = await jokeCommand.run(message, args);
            expect(result).toBeNull();
            expect(messageSpy).toHaveBeenLastCalledWith("This is a mocked joke. :rofl:");
        });
    });
});
