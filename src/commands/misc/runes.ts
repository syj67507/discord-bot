import { Command } from "../../custom/base";
import { Message } from "discord.js";
// If the following line is causing issues
// run `npm install @fightmegg/riot-api`
// then delete these comments
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
        // console.log("champion:", champion);
        // console.log(await getAllChampions())
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
        // TODO:
        // 1. Get all the LoL champions
        // 2. Verify that the provided champion name from user input is a valid LoL champion
        //    If the champion name is not valid, then reply with an error message
        // 3. Make a rune page link
        // 4. Reply to the user with the rune page link

        // HINTS:
        // - Remember that the following run() function/method is called whenever you use this
        //   command
        // - The input from the text channel when using a command will be stored in the {champion}
        //   variable in the first line of the run() function/method
        // - Each function/method is intended to be small part of the whole command. Read the
        //   documents above each "helper" function to find out what it is supposed to do and figure how
        //   to use them together in the function
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

    function championString() {
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

    // TODO:
    // Champs contains an object that looks like the following document
    // https://ddragon.leagueoflegends.com/cdn/11.18.1/data/en_US/champion.json
    // Here find a way to transform this object (rawChampionInfo)
    // into an an array of strings where each index is a champion and store it into
    // a (champions) variable.
    // HINT: Use the following page on Objects for what you could possibly use
    // Objects use key: value pairs to store data
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object

    return championString();
}

/**
 * Returns a link to the champion's most popular rune page.
 *
 * @param champion Name of the champion
 * @returns {string} A link to the champion's most popular rune page
 */
function buildRunePageLink(champion: string): string {
    // TODO:
    // Using the parameter {champion}, create a URL to the champion's rune page
    // Will require string manipulation/interpolation
    let url = "https://u.gg/lol/champions/";
    return (url = url.concat("", champion));
}

export default runesCommand;
