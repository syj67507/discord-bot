const MusicManager = require("../custom/music-manager");
class Client {
    constructor() {}
    on(string, fn) {}
}
let mm = new MusicManager(new Client());

const song = {
    title: "Title",
    link: "Link",
    duration: "Duration",
};
const song2 = {
    title: "Title2",
    link: "Link2",
    duration: "Duration2",
};

beforeEach(() => {
    mm = new MusicManager(new Client());
});

test("Testing queueAtBeginning()", () => {
    expect(mm.playlist).toEqual([]);
    mm.queueAtBeginning(song);
    expect(mm.playlist).toEqual([song]);
    mm.queueAtBeginning(song2);
    expect(mm.playlist).toEqual([song2, song]);
});

test("Testing queue()", () => {
    expect(mm.playlist).toEqual([]);
    mm.queue(song);
    expect(mm.playlist).toEqual([song]);
    mm.queue(song2);
    expect(mm.playlist).toEqual([song, song2]);
});

test("Testing queueLength()", () => {
    mm.queue(song);
    mm.queue(song2);
    expect(mm.queueLength()).toEqual(2);
});

test("Testing clearQueue()", () => {
    expect(mm.playlist).toEqual([]);
    mm.queue(song);
    mm.queue(song2);
    expect(mm.playlist).toEqual([song, song2]);
    mm.clearQueue();
    expect(mm.playlist).toEqual([]);
});
