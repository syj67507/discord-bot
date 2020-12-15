const { addToQueue } = require("../commands/queue");

test("Testing addToQueue function", () => {
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
