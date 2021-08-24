import { Command } from "../../../custom/base";

const sampleCommand: Command = {
    name: "sample",
    description: "Sample Description",
    aliases: ["alias"],
    enabled: true,
    run: async () => {
        return null;
    },
    arguments: [],
};

export default sampleCommand;
