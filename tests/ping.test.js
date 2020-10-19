const ping = require("../commands/ping.js").execute;
const { MockDiscord, MockMessage } = require("./mocks/MockDiscord.js");
//const Message = require('./mocks/discord_mock.js');

// setting up the Discord mock
const mock = new MockDiscord();
const user = { id: 9, username: "username", discriminator: "1234" };

afterAll(() => {
    mock.client.destroy();
});

test("Testing ping command", () => {
    const message = new MockMessage("", mock.channel, {});
    expect(ping(message, [])).resolves.toBeUndefined();
    expect(ping(null, [])).rejects.toThrow();
});
