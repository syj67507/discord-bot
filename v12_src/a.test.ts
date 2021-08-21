// import { a } from "./a"; // cant do this because the commands
// import is not mocked
// jest.mock("./index", () => {
//     return {
//         __esModule: true,
//         default: {},
//         commands: "mocked command",
//     };
// });
jest.mock("./index");
import { a } from "./a";

describe("a", () => {
    it("this is testing the mock", () => {
        // define the commands mock
        // essentially mocks: import { commands } from "./index";
        // jest.mock("./index", () => {
        //     return {
        //         commands: "mocked command",
        //     };
        // });

        // const { a } = require("./a");
        expect(a()).toBe("mocked commands");
    });
});
