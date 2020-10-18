const { processGuess, verifyAnswer } = require("../commands/pokemon").test;
const Discord = require("discord.js");

test("Testing processGuess", () => {
    const guess = new Discord.Collection();
    const result = processGuess(guess);
    expect(result).toBeNull();
});

test("Testing verifyAnswer true", () => {
    const guess = ["yes"];
    const answer = ["yes"];
    const result = verifyAnswer(guess, answer);
    expect(result).toEqual("That's correct!");
});

test("Testing verifyAnswer false", () => {
    const guess = ["yes"];
    const answer = ["no"];
    const result = verifyAnswer(guess, answer);
    expect(result).toEqual([
        "Sorry, that's incorrect.",
        `The correct answer is ${answer}`,
    ]);
});

test("Testing verifyAnswer false", () => {
    const guess = ["yes"];
    const answer = ["yes", "no"];
    const result = verifyAnswer(guess, answer);
    expect(result).toEqual([
        "Sorry, that's incorrect.",
        `The correct answer is ${answer}`,
    ]);
});
