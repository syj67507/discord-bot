import { Command } from "../../../custom/base";

const sampleUtilityCommand: Command = {
    name: "sampleUtility",
    description: "Sample Utility Description",
    aliases: ["aliasUtility"],
    enabled: true,
    run: async () => {
        return null;
    },
    arguments: [],
};

export default sampleUtilityCommand;
