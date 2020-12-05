const { isYTLink } = require("../commands/play");

test("Testing isYTLink", () => {
    const possibilities = [
        "https://youtu.be/",
        "https://www.youtu.be/",
        "https://youtube.com/watch?",
        "https://www.youtube.com/watch?",
    ];
    for (const p of possibilities) {
        expect(isYTLink(p)).toBeTruthy();
    }
    expect(isYTLink("not a link")).toBeFalsy();
});
