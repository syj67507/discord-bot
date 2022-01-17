import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import Pokedex from "pokedex-promise-v2";
import { Command } from "../../custom/base";
import { logger as log, format as f } from "../../custom/logger";
import { ApplicationCommandOptionType } from "discord-api-types";

/**
 * Represents a set of Trivia data
 */
interface TriviaData {
    /** The trivia question to prompt the player */
    question: string;
    /**
     * The answer to the trivia question, if there is more than one word to the answer
     * then this will be sorted in ascending ASCII character order
     */
    answer: string[];
    /** A picture that can be displayed with the prompt */
    picture: string;
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
            type: ApplicationCommandOptionType.String,
            choices: ["type", "who"],
        },
    ],
    async run(interaction: CommandInteraction, options: any) {
        await interaction.deferReply(); // defer to allow enough time

        log.debug(f("pokemon", "Fetching random pokemon..."));
        const pkmnInfo = await PokemonCommandHelper.fetchRandomPokemon();

        log.debug(f("pokemon", "Making question..."));
        let question, answer, picture;
        switch (options.category) {
            case "type":
                ({ question, picture, answer } =
                    PokemonCommandHelper.makeTypeQuestion(pkmnInfo));
                break;
            case "who":
            default:
                ({ question, picture, answer } =
                    PokemonCommandHelper.makeWhoQuestion(pkmnInfo));
                break;
        }
        const embed = new MessageEmbed()
            .setColor("#B51B1B")
            .setTitle(question)
            .setAuthor("Pokemon Type Trivia", PokemonCommandHelper.pokeballIcon)
            .setImage(picture);
        await interaction.channel!.send({ embeds: [embed] });

        log.debug(f("pokemon", `Answer: ${answer}`));

        // Retrieve guess
        log.debug(f("pokemon", "Awaiting user's guess..."));
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

        log.debug(f("pokemon", "Checking if guess is correct..."));
        const isCorrect = PokemonCommandHelper.verifyAnswer(guess, answer);
        await interaction.editReply("Trivia question closed.");

        let msg: string;
        if (isCorrect) {
            msg = "That's correct!";
        } else {
            msg = `Sorry that's incorrect.\nThe correct answer is ${answer}`;
        }
        await userGuess.reply(msg);
        return null;
    },
};

export class PokemonCommandHelper {
    static pokeballIcon =
        "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/b05d80a0-2a64-476e-8971-3fbb10b3173f/de9yh1g-c086a995-be28-488f-b709-c009e3f1733f.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOiIsImlzcyI6InVybjphcHA6Iiwib2JqIjpbW3sicGF0aCI6IlwvZlwvYjA1ZDgwYTAtMmE2NC00NzZlLTg5NzEtM2ZiYjEwYjMxNzNmXC9kZTl5aDFnLWMwODZhOTk1LWJlMjgtNDg4Zi1iNzA5LWMwMDllM2YxNzMzZi5wbmcifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6ZmlsZS5kb3dubG9hZCJdfQ.6kqNinRj421Gq-PVszIVuTfEZxHaI62nCULU4aRKY1U";

    /**
     * Fetches a random pokemon from the PokeAPI.
     *
     * @returns A JSON structure of the random Pokemon.
     */
    static async fetchRandomPokemon(): Promise<any> {
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
    static makeTypeQuestion(pkmnInfo: any): TriviaData {
        // Capitalize first letter of name for question prompt
        let pkmnName: string = pkmnInfo.name;
        pkmnName = pkmnName.substring(0, 1).toUpperCase() + pkmnName.substring(1);

        const pkmnType: string[] = pkmnInfo.types.map((type: any) => type.type.name);

        return {
            question: `What is __${pkmnName}'s__ typing?`,
            picture: pkmnInfo.sprites.other["official-artwork"].front_default,
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
    static makeWhoQuestion(pkmnInfo: any): TriviaData {
        let pkmnName: string = pkmnInfo.name;
        pkmnName = pkmnName.substring(0, 1).toUpperCase() + pkmnName.substring(1);

        return {
            question: "Who's that Pokémon?!",
            answer: [pkmnName],
            picture: pkmnInfo.sprites.other["official-artwork"].front_default,
        };
    }

    /**
     * Checks the guess with the answer. Returns true is the guess is correct,
     * otherwise the function returns false
     *
     * @param {string[]}  guess     What the user guessed.
     * @param {string[]}  answer    The correct answer to the question.
     *
     * @returns {boolean}          The message to notify if the user got it right.
     */
    static verifyAnswer(guess: string[], answer: string[]): boolean {
        if (guess.length == answer.length) {
            // sort the answers to make sure stringify returns the same result each time
            if (
                JSON.stringify(guess.sort().map((s) => s.toLowerCase())) ===
                JSON.stringify(answer.sort().map((s) => s.toLowerCase()))
            ) {
                return true;
            }
        }
        return false;
    }
}

export default pokemonCommand;
