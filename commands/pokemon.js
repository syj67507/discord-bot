const Pokedex = require("pokedex-promise-v2");
const UsageError = require("../custom/UsageError");
const log = require("../custom/logger").logger;
const f = require("../custom/logger").format;
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "pokemon",
    description: "Pokemon Trivia Game!",
    usage: `
        ${process.env.PREFIX}pokemon type
        `,
    async execute(message, args) {
        if (args[0] !== "type") {
            message.channel.send("Check usage");
            throw new UsageError("Did not specify type as an argument");
        }

        log.debug(f("pokemon", "Fetching random pokemon..."));
        const pkmnInfo = await fetchRandomPokemon();

        log.debug(f("pokemon", "Making question..."));
        const { question, files, answer } = makeTypeQuestion(pkmnInfo, message);
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
        function filter(incMsg) {
            return incMsg.author === message.author;
        }
        const answerTimeout = {
            time: 30000,
            max: 1,
        };
        let guess = await message.channel.awaitMessages(filter, answerTimeout);
        guess = processGuess(guess);
        log.debug(f("pokemon", `Guess: ${guess}`));

        log.debug(f("pokemon", "Processing answer..."));
        if (guess === null) {
            message.reply("I didn't get an answer.");
        } else {
            const msg = verifyAnswer(guess, answer);
            message.channel.send(msg);
        }
    },
    test: {
        processGuess,
        verifyAnswer,
        fetchRandomPokemon,
    },
};

/**
 * Fetches a random pokemon from the PokeAPI.
 *
 * @returns A JSON structure of the random Pokemon.
 */
async function fetchRandomPokemon() {
    // Fetch a random pokemon
    const pokeClient = new Pokedex();
    const pkmnList = await pokeClient.getPokemonsList();
    const rdx = Math.floor(Math.random() * pkmnList.count);
    const pkmnName = pkmnList.results[rdx].name;
    const pkmnInfo = await pokeClient.getPokemonByName(pkmnName);
    return pkmnInfo;
}

/**
 * Makes a question for the given Pokemon.
 *
 * @param {object}          pkmnInfo    The random Pokemon in JSON object form
 * @param {Discord.Message} message     The message that invoked this command.
 *
 * @returns {Array}                     An array of types of the Pokemon
 */
function makeTypeQuestion(pkmnInfo) {
    // Make the question and ask
    let pkmnName = pkmnInfo.name;
    pkmnName = pkmnName.substring(0, 1).toUpperCase() + pkmnName.substring(1);
    const pkmnPic = pkmnInfo.sprites.front_default;
    const pkmnType = [];
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
 * @param {Discord.Collection} guess The guess of the user.
 *
 * @returns {Array}                  An array that represents what the user guessed.
 */
function processGuess(guess) {
    if (guess.first() === undefined) {
        return null;
    }
    guess = guess.first().content.split(/[ ]+/);
    return guess;
}

/**
 * Checks the guess with the answer. Returns the appropriate string
 * to send to the channel.
 *
 * @param {Array} guess     What the user guessed.
 * @param {Array} answer    The correct answer to the question.
 *
 * @returns {string}        The message to notify if the user got it right.
 */
function verifyAnswer(guess, answer) {
    if (guess.length == answer.length) {
        if (JSON.stringify(guess.sort()) === JSON.stringify(answer.sort())) {
            return "That's correct!";
        }
    }
    return ["Sorry, that's incorrect.", `The correct answer is ${answer}`];
}
