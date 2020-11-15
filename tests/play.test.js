const { MockDiscord, MockMessage } = require("./mocks/MockDiscord.js");
const { validateLink } = require("../commands/play");
const UsageError = require("../custom/UsageError");

// setting up the Discord mock
const mock = new MockDiscord();
const user = { id: 9, username: "username", discriminator: "1234" };

afterAll(() => {
    mock.client.destroy();
});

test("Testing invalid args validateLink in play command", () => {
    const message = new MockMessage("", mock.channel, {});
    const possibilities = [[], ["Bad Link"], ["www.google.com"]];

    for (const p of possibilities) {
        const args = p;
        expect(() => {
            validateLink(message, args);
        }).toThrow();
    }
});

test("Testing valid args validateLink in play command", () => {
    const message = new MockMessage("", mock.channel, {});
    const possibilities = [
        ["https://youtu.be/"],
        ["https://youtube.com/watch?"],
        ["https://www.youtu.be/"],
        ["https://www.youtube.com/watch?"],
    ];
    for (const p of possibilities) {
        const args = p;
        expect(validateLink(message, args)).toBe(args[0]);
    }
});
