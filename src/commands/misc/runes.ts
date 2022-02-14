import { Command } from "../../custom/base";
import { Message } from "discord.js";
import { DDragon } from "@fightmegg/riot-api";

const runesCommand: Command = {
    name: "runes",
    description: "Provides an op.gg link for the a given League of Legends champion.",
    enabled: true,
    arguments: [
        {
            key: "championName",
            description: "What is the name of the champion?",
            type: "string",
        },
    ],

    async run(message: Message, args: any) {
        const allChampions = await getAllChampions();
        const userInput = args.championName as string;

        let valid = false;

        for (let i = 0; i < allChampions.length; i++) {
            const currChamp = allChampions[i];
            if (currChamp === userInput) {
                valid = true;
            }
        }
        if (valid) {
            const URL = buildRunePageLink(userInput);
            message.reply(URL);
            return null;
        } else {
            message.reply("Please enter a valid champion!");
            return null;
        }
    },
};

/**
 * Returns a string array where each index is a different champion.
 * Internally uses a RiotAPI client to retrieve all champion data from DDragon.
 * @returns {string[]} Array of all the champions
 */
async function getAllChampions(): Promise<string[]> {
    const ddragon = new DDragon();
    const rawChampionInfo = await ddragon.champion.all();
    const champions = Object.keys(rawChampionInfo.data);

    const arr = [];
    for (let i = 0; i < champions.length; i++) {
        const champion = rawChampionInfo.data[champions[i]];
        let name = champion.name;
        if (name.includes(" ")) {
            name = name.replace(" ", "");
        } else if (name.includes("'")) {
            name = name.replace("'", "");
        }
        name = name.toLowerCase();
        arr.push(name);
    }
    return arr;
}

/**
 * Returns a link to the champion's most popular rune page.
 *
 * @param champion Name of the champion
 * @returns {string} A link to the champion's most popular rune page
 */
function buildRunePageLink(champion: string): string {
    const url = "https://u.gg/lol/champions/";
    return url.concat("", champion);
}

export default runesCommand;
