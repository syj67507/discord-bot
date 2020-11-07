const joke = require("../commands/joke.js").execute;
const { MockDiscord, MockMessage } = require("./mocks/MockDiscord.js");

// setting up the Discord mock
const mock = new MockDiscord();
const user = { id: 9, username: "username", discriminator: "1234" };

// setting up the axios mock
const axios = require("axios");
const { appendEmoji } = require("../commands/joke.js").test;
jest.mock("axios");

afterAll(() => {
    mock.client.destroy();
});

test("Testing joke command", () => {
    const message = new MockMessage("", mock.channel, {});
    const res = {
        data: {
            attachments: ["Test joke"],
        },
    };
    axios.get.mockResolvedValue(res);
    expect(joke(message, [])).resolves.toBeUndefined();
    expect(joke(null, [])).rejects.toThrow();
});

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
