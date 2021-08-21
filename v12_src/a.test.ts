// import { a } from "./a"; // cant do this because the commands
// import is not mocked
describe("a", () => {
    it("this is testing the mock", () => {
        // define the commands mock
        // essentially mocks: import { commands } from "./index";
        jest.mock("./index", () => {
            return {
                commands: "mocked commands",
            };
        });

        const { a } = require("./a");
        expect(a()).toBe("mocked commands");
    });
});
