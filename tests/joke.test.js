// setting up the axios mock
const axios = require("axios");
const { appendEmoji } = require("../commands/joke.js").test;
jest.mock("axios");

test("Testing appendEmoji :rofl:", () => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.1);
    const s = appendEmoji("Test joke");
    expect(s).toEqual("Test joke :rofl:");
    jest.spyOn(global.Math, "random").mockRestore();
});

test("Testing appendEmoji :joy:", () => {
    jest.spyOn(global.Math, "random").mockReturnValue(1.1);
    const s = appendEmoji("Test joke");
    expect(s).toEqual("Test joke :joy:");
    jest.spyOn(global.Math, "random").mockRestore();
});
