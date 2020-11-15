const { addToQueue } = require("../commands/queue");
const { MockDiscord, MockMessage } = require("./mocks/MockDiscord.js");

// setting up the Discord mock
const mock = new MockDiscord();
const user = { id: 9, username: "username", discriminator: "1234" };

afterAll(() => {
    mock.client.destroy();
});

test("Testing addToQueue function", () => {
    const message = new MockMessage("", mock.channel, {});
    let musicQueue = [];
    expect(addToQueue(musicQueue, "song link")).toBeUndefined();
    expect(() => {
        addToQueue(musicQueue, 1);
    }).toThrow();
    expect(() => {
        addToQueue(musicQueue, {});
    }).toThrow();
    expect(() => {
        addToQueue(musicQueue, []);
    }).toThrow();
});
