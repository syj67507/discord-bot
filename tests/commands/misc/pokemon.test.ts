import axios from "axios";
import { Collection } from "discord.js";
import pokemonCommand, { PokemonCommandHelper } from "../../../src/commands/misc/pokemon";

describe("Testing Pokemon command", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.spyOn(axios, "get")
            .mockImplementationOnce(async () => {
                return {
                    data: {
                        count: 1,
                        results: [{ name: "greninja", url: "mock.pokeapi.com/1" }],
                        next: "",
                        previous: null,
                    },
                };
            })
            .mockImplementationOnce(async () => {
                return { data: global["pokemonData"] };
            });
    });

    describe("Testing Pokemon command's helper functions", () => {
        it("should fetch a random pokemon", async () => {
            const result = await PokemonCommandHelper.fetchRandomPokemon();
            expect(result).toEqual(global["pokemonData"]);
        });

        it("should make a type question from the fetched pokemon", async () => {
            const pkmnInfo = await PokemonCommandHelper.fetchRandomPokemon();
            const result = PokemonCommandHelper.makeTypeQuestion(pkmnInfo);
            expect(result).toEqual({
                question: "What is __Greninja's__ typing?",
                picture:
                    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png",
                answer: ["water", "dark"],
            });
        });

        it("should make a who question from the fetched pokemon", async () => {
            const pkmnInfo = await PokemonCommandHelper.fetchRandomPokemon();
            const result = PokemonCommandHelper.makeWhoQuestion(pkmnInfo);
            expect(result).toEqual({
                question: "Who's that Pokémon?!",
                picture:
                    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/658.png",
                answer: ["Greninja"],
            });
        });

        it("it should verify a correct guess with the answer successfully", () => {
            const testCases = [
                {
                    // successful case unsorted
                    guess: ["dark", "water"],
                    answer: ["water", "dark"],
                    result: true,
                },
                {
                    // successful case sorted
                    guess: ["dark", "water"],
                    answer: ["dark", "water"],
                    result: true,
                },
                {
                    // successful case with different capitalization
                    guess: ["dark", "Water"],
                    answer: ["Dark", "water"],
                    result: true,
                },
                {
                    // same number of answers but incorrect
                    guess: ["water", "fighting"],
                    answer: ["water", "dark"],
                    result: false,
                },
                {
                    // different number of answers
                    guess: ["water"],
                    answer: ["water", "dark"],
                    result: false,
                },
            ];

            for (const testCase of testCases) {
                const result = PokemonCommandHelper.verifyAnswer(
                    testCase.guess,
                    testCase.answer
                );
                expect(result).toBe(testCase.result);
            }
        });
    });

    describe("Testing the Pokemon command's run function", () => {
        const interaction = global["interaction"];

        // This will serve as the message object that is returned from await messages
        // The guess provided from the user
        const guessMessage = {
            reply: jest.fn(),
            content: undefined,
        };

        beforeEach(() => {
            guessMessage.content = undefined;
        });

        it("should test that a correct answer returns a success message for type question", async () => {
            jest.spyOn(interaction.channel, "awaitMessages").mockImplementation(
                async () => {
                    guessMessage.content = "water dark";
                    const c = new Collection<string, typeof guessMessage>();
                    c.set("mockMessageId", guessMessage);
                    return c;
                }
            );
            const guessMessageReplySpy = jest.spyOn(guessMessage, "reply");
            const result = await pokemonCommand.run(
                interaction,
                {
                    category: "type",
                },
                global["testCommands"],
                global["testCommandGroups"]
            );
            expect(result).toBeNull();
            expect(guessMessageReplySpy).toHaveBeenLastCalledWith("That's correct!");
        });

        it("should handle when on guess was provided", async () => {
            jest.spyOn(interaction.channel, "awaitMessages").mockImplementation(
                async () => {
                    return new Collection<string, typeof guessMessage>();
                }
            );
            const guessMessageReplySpy = jest.spyOn(guessMessage, "reply");
            const result = await pokemonCommand.run(
                interaction,
                {
                    category: "who",
                },
                global["testCommands"],
                global["testCommandGroups"]
            );
            expect(result).toBeNull();
            expect(guessMessageReplySpy).not.toHaveBeenCalled();
        });

        it("should test an incorrect answer returns a failed message for who question", async () => {
            jest.spyOn(interaction.channel, "awaitMessages").mockImplementation(
                async () => {
                    guessMessage.content = "pikachu";
                    const c = new Collection<string, typeof guessMessage>();
                    c.set("mockMessageId", guessMessage);
                    return c;
                }
            );
            const guessMessageReplySpy = jest.spyOn(guessMessage, "reply");
            const result = await pokemonCommand.run(
                interaction,
                {
                    category: "who",
                },
                global["testCommands"],
                global["testCommandGroups"]
            );
            expect(result).toBeNull();
            expect(
                guessMessageReplySpy.mock.calls[0][0].includes("Sorry that's incorrect")
            ).toBe(true);
        });
    });
});
