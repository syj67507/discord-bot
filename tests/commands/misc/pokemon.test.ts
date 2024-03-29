jest.mock("pokedex-promise-v2", () => {
    class MockPokedex {
        constructor() {
            // Empty
        }
        getPokemonsList() {
            return {
                count: 1,
                results: [{ name: "test pokemon" }],
            };
        }
        getPokemonByName(name: string) {
            if (name === "test pokemon") {
                return {
                    name: "test pokemon",
                    sprites: {
                        front_default: "front_default",
                    },
                    types: [{ type: { name: "normal" } }],
                };
            }
        }
    }
    return MockPokedex;
});

import pokemonCommand, {
    fetchRandomPokemon,
    makeTypeQuestion,
    processGuess,
    verifyAnswer,
} from "../../../v12_src/commands/misc/pokemon";

import { Collection } from "discord.js";

describe("Testing Pokemon command", () => {
    describe("Testing Pokemon command's helper functions", () => {
        it("should fetch a random pokemon", async () => {
            const result = await fetchRandomPokemon();
            expect(result).toEqual({
                name: "test pokemon",
                sprites: {
                    front_default: "front_default",
                },
                types: [{ type: { name: "normal" } }],
            });
        });

        it("should make a type question from the fetched pokemon", async () => {
            const pkmnInfo = await fetchRandomPokemon();
            const result = makeTypeQuestion(pkmnInfo);
            expect(result).toEqual({
                question: "What is __Test pokemon's__ typing?",
                files: ["front_default"],
                answer: ["normal"],
            });
        });

        it("it should process the guess successfully", () => {
            const guess = new Collection<string, any>();
            guess.set("0", {
                content: "normal",
            });
            const result = processGuess(guess);
            expect(result).toEqual(["normal"]);
        });

        it("it should process the guess if nothing is passed", () => {
            const guess = new Collection<string, any>();
            guess.set("0", {
                content: "normal fighting",
            });
            const result = processGuess(guess);
            expect(result).toEqual(["normal", "fighting"]);
        });

        it("it should process the guess if two types are passed", () => {
            const guess = new Collection<string, any>();
            const result = processGuess(guess);
            expect(result).toEqual([]);
        });

        it("should verify the correct answer", () => {
            const cases = [
                { guess: ["normal"], answer: ["normal"] },
                { guess: ["normal", "fighting"], answer: ["normal", "fighting"] },
                { guess: ["fighting", "normal"], answer: ["fighting", "normal"] },
                { guess: [""], answer: [""] },
            ];
            for (const cas of cases) {
                const { guess, answer } = cas;
                const result = verifyAnswer(guess, answer);
                expect(result).toEqual(["That's correct!"]);
            }
        });

        it("should verify the incorrect answer", () => {
            const cases = [
                { guess: ["normal"], answer: ["fighting"] },
                { guess: ["normal", "water"], answer: ["normal", "fighting"] },
                { guess: ["normal"], answer: ["normal", "fighting"] },
            ];
            for (const c of cases) {
                const { guess, answer } = c;
                const result = verifyAnswer(guess, answer);
                expect(result).toEqual([
                    "Sorry, that's incorrect.",
                    `The correct answer is ${answer}`,
                ]);
            }
        });
    });

    describe("Testing the Pokemon command's run function", () => {
        const message: any = {
            reply: jest.fn(),
            channel: {
                awaitMessages() {
                    const messages = new Collection<string, any>();
                    messages.set("0", {
                        content: "normal", // correct answer
                    });
                    return messages;
                },
            },
        };
        beforeEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });
        it("should test that a correct answer returns a success message", async () => {
            const messageSpy = jest.spyOn(message, "reply");
            const result = await pokemonCommand.run(message, {
                type: "type",
            });
            expect(result).toBeNull();
            expect(messageSpy).toHaveBeenLastCalledWith(["That's correct!"]);
        });

        it("should test that an incorrect answer returns a failed message", async () => {
            jest.spyOn(message.channel, "awaitMessages").mockImplementation(() => {
                const messages = new Collection<string, any>();
                messages.set("0", {
                    content: "fighting", // incorrect answer
                });
                return messages;
            });
            const messageSpy = jest.spyOn(message, "reply");
            const result = await pokemonCommand.run(message, {
                type: "type",
            });
            expect(result).toBeNull();
            expect(messageSpy).toHaveBeenLastCalledWith([
                "Sorry, that's incorrect.",
                "The correct answer is normal",
            ]);
        });

        it("should test the case for an empty answer", async () => {
            jest.spyOn(message.channel, "awaitMessages").mockImplementation(async () => {
                const messages = new Collection();
                return messages;
            });
            const messageSpy = jest.spyOn(message, "reply");
            const result = await pokemonCommand.run(message, {
                type: "type",
            });
            expect(result).toBeNull();
            expect(messageSpy).toHaveBeenLastCalledWith("I didn't get an answer.");
        });
    });
});
