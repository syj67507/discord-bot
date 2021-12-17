import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import Pokedex from "pokedex-promise-v2";
import { Command, OptionTypes } from "../../custom/base";
import { logger as log, format as f } from "../../custom/logger";

/**
 * Represents a set of Trivia data
 */
interface TriviaData {
    question: string;
    answer: string[];
    /** Any pictures or other related files that can be displayed with the prompt */
    files: string[];
}

const pokemonCommand: Command = {
    name: "pokemon",
    aliases: ["pkmn"],
    description: "Pokemon Trivia!",
    enabled: true,
    options: [
        {
            name: "category",
            description: "The kind of trivia question",
            required: false,
            type: OptionTypes.STRING,
            choices: ["type", "who"],
        },
    ],
    async run(interaction: CommandInteraction, options: any) {
        await interaction.deferReply(); // defer to allow enough time

        log.debug(f("pokemon", "Fetching random pokemon..."));
        const pkmnInfo = await fetchRandomPokemon();

        log.debug(f("pokemon", "Making question..."));
        let question, answer, files;
        switch (options.category) {
            case "type":
                ({ question, files, answer } = makeTypeQuestion(pkmnInfo));
                break;
            case "who":
            default:
                ({ question, files, answer } = makeWhoQuestion(pkmnInfo));
                break;
        }
        const embed = new MessageEmbed()
            .setColor("#B51B1B")
            .setTitle(question)
            .setAuthor(
                "Pokemon Type Trivia",
                "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/b05d80a0-2a64-476e-8971-3fbb10b3173f/de9yh1g-c086a995-be28-488f-b709-c009e3f1733f.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOiIsImlzcyI6InVybjphcHA6Iiwib2JqIjpbW3sicGF0aCI6IlwvZlwvYjA1ZDgwYTAtMmE2NC00NzZlLTg5NzEtM2ZiYjEwYjMxNzNmXC9kZTl5aDFnLWMwODZhOTk1LWJlMjgtNDg4Zi1iNzA5LWMwMDllM2YxNzMzZi5wbmcifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6ZmlsZS5kb3dubG9hZCJdfQ.6kqNinRj421Gq-PVszIVuTfEZxHaI62nCULU4aRKY1U"
            )
            .setImage(files[0]);
        await interaction.channel!.send({ embeds: [embed] });

        log.debug(f("pokemon", `Answer: ${answer}`));

        log.debug(f("pokemon", "Awaiting user's guess..."));
        // Retrieve guess
        const userGuess = (
            await interaction.channel!.awaitMessages({
                filter: (incMsg: Message) =>
                    incMsg.author.id === interaction.member.user.id,
                max: 1,
                time: 15000,
            })
        ).first();

        await interaction.editReply("Trivia question closed.");

        // If no guess provided
        if (!userGuess) {
            await interaction.followUp(
                `${interaction.member.user} I didn't get an answer`
            );
            return null;
        }

        const guess = userGuess.content.split(/[ ]+/);
        log.debug(f("pokemon", `Guess: ${guess}`));

        log.debug(f("pokemon", "Processing answer..."));
        const msg = verifyAnswer(guess, answer).join("\n");
        await interaction.editReply("Trivia question closed.");
        await userGuess.reply(msg);
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
 * Makes a question asking what is the typing for the given Pokemon.
 *
 * @param {any}             pkmnInfo    The random Pokemon in JSON object form
 * @param {Discord.Message} message     The message that invoked this command.
 *
 * @returns {TriviaData} An object representing the trivia type question.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function makeTypeQuestion(pkmnInfo: any): TriviaData {
    // Make the question and ask
    let pkmnName: string = pkmnInfo.name;
    pkmnName = pkmnName.substring(0, 1).toUpperCase() + pkmnName.substring(1);
    const pkmnPic: string = pkmnInfo.sprites.other["official-artwork"].front_default;
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
 * Makes a question asking what is the name for the given Pokemon.
 *
 * @param {any}             pkmnInfo    The random Pokemon in JSON object form
 * @param {Discord.Message} message     The message that invoked this command.
 *
 * @returns {TriviaData} An object representing the trivia type question.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function makeWhoQuestion(pkmnInfo: any): TriviaData {
    const pkmnPic = pkmnInfo.sprites.other["official-artwork"].front_default;
    const pkmnName = (pkmnInfo.name as string).toLowerCase();

    return {
        question: "Who's that Pokémon?!",
        answer: [pkmnName],
        files: [pkmnPic],
    };
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
