import { Collection, Message, MessageEmbed } from "discord.js";
import Pokedex from "pokedex-promise-v2";
import { Command } from "../../custom/base";
import { logger as log, format as f } from "../../custom/logger";

const pokemonCommand: Command = {
    name: "pokemon",
    aliases: ["pkmn"],
    description: "Pokemon Trivia!",
    enabled: true,
    arguments: [
        {
            key: "type",
            type: "string",
            description: "Choose a trivia category: `type`?",
            validator: (value: string) => ["type"].includes(value),
        },
    ],
    async run(message: Message) {
        log.debug(f("pokemon", "Fetching random pokemon..."));
        const pkmnInfo = await fetchRandomPokemon();

        log.debug(f("pokemon", "Making question..."));
        const { question, files, answer } = makeTypeQuestion(pkmnInfo);
        const embed = new MessageEmbed()
            .setColor("#B51B1B")
            .setTitle(question)
            .setAuthor(
                "Pokemon Type Trivia",
                "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/b05d80a0-2a64-476e-8971-3fbb10b3173f/de9yh1g-c086a995-be28-488f-b709-c009e3f1733f.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOiIsImlzcyI6InVybjphcHA6Iiwib2JqIjpbW3sicGF0aCI6IlwvZlwvYjA1ZDgwYTAtMmE2NC00NzZlLTg5NzEtM2ZiYjEwYjMxNzNmXC9kZTl5aDFnLWMwODZhOTk1LWJlMjgtNDg4Zi1iNzA5LWMwMDllM2YxNzMzZi5wbmcifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6ZmlsZS5kb3dubG9hZCJdfQ.6kqNinRj421Gq-PVszIVuTfEZxHaI62nCULU4aRKY1U"
            )
            .setImage(files[0]);
        message.reply(embed);

        log.debug(f("pokemon", `Answer: ${answer}`));

        log.debug(f("pokemon", "Awaiting user's guess..."));
        // Retrieve guess
        function filter(incMsg: Message) {
            return incMsg.author === message.author;
        }
        const answerTimeout = {
            time: 30000,
            max: 1,
        };
        const userGuess = await message.channel.awaitMessages(filter, answerTimeout);
        const guess = processGuess(userGuess);
        log.debug(f("pokemon", `Guess: ${guess}`));

        log.debug(f("pokemon", "Processing answer..."));
        if (guess.length === 0) {
            message.reply("I didn't get an answer.");
            return null;
        }
        const msg = verifyAnswer(guess, answer);
        message.reply(msg);
        return null;
    },
};

/**
 * Fetches a random pokemon from the PokeAPI.
 *
 * @returns A JSON structure of the random Pokemon.
 */
export async function fetchRandomPokemon(): Promise<any> {
    // Fetch a random pokemon
    const pokeClient = new Pokedex();
    const pkmnList = await pokeClient.getPokemonsList();
    const rdx = Math.floor(Math.random() * pkmnList.count);
    const pkmnName: string = pkmnList.results[rdx].name;
    const pkmnInfo = await pokeClient.getPokemonByName(pkmnName);
    return pkmnInfo;
}

/**
 * Makes a question for the given Pokemon.
 *
 * @param {object}          pkmnInfo    The random Pokemon in JSON object form
 * @param {Discord.Message} message     The message that invoked this command.
 *
 * @returns {any} An object representing the trivia type question.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function makeTypeQuestion(pkmnInfo: any): any {
    // Make the question and ask
    let pkmnName: string = pkmnInfo.name;
    pkmnName = pkmnName.substring(0, 1).toUpperCase() + pkmnName.substring(1);
    const pkmnPic: string = pkmnInfo.sprites.front_default;
    const pkmnType: string[] = [];
    for (const type of pkmnInfo.types) {
        pkmnType.push(type.type.name);
    }
    const question = `What is __${pkmnName}'s__ typing?`;
    return {
        question: question,
        files: [pkmnPic],
        answer: pkmnType,
    };
}

/**
 * Processes the guess for the question that was asked.
 *
 * @param {Collection<string, Message>} guess The guess of the user.
 *
 * @returns {Array}                  An array that represents what the user guessed.
 */
export function processGuess(guess: Collection<string, Message>): string[] {
    const g = guess.first();
    if (g !== undefined) {
        return g.content.split(/[ ]+/);
    }
    return [];
}

/**
 * Checks the guess with the answer. Returns the appropriate string
 * to send to the channel.
 *
 * @param {string[]} guess     What the user guessed.
 * @param {string[]} answer    The correct answer to the question.
 *
 * @returns {string[]}         The message to notify if the user got it right.
 */
export function verifyAnswer(guess: string[], answer: string[]): string[] {
    if (guess.length == answer.length) {
        if (JSON.stringify(guess.sort()) === JSON.stringify(answer.sort())) {
            return ["That's correct!"];
        }
    }
    return ["Sorry, that's incorrect.", `The correct answer is ${answer}`];
}

export default pokemonCommand;
