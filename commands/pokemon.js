const Pokedex = require("pokedex-promise-v2");

module.exports = {
    name: "pokemon",
    description: "Pokemon Trivia Game!",
    usage: `
        ${process.env.PREFIX}pokemon
        `,
    async execute(message, args) {
        const pkmnInfo = await fetchRandomPokemon();

        const answer = makeTypeQuestion(pkmnInfo, message);
        console.log("Answer:", answer);

        const guess = await retrieveGuess(message);
        console.log("Guess: ", guess);
        if (guess === null) {
            message.reply("I didn't get an answer.");
        } else {
            const msg = verifyAnswer(guess, answer);
            message.channel.send(msg);
        }
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
 * Makes a question for the given Pokemon and asks the user in the text channel.
 *
 * @param {object}          pkmnInfo    The random Pokemon in JSON object form
 * @param {Discord.Message} message     The message that invoked this command.
 *
 * @returns {Array}                     An array of types of the Pokemon
 */
function makeTypeQuestion(pkmnInfo, message) {
    // Make the question and ask
    let pkmnName = pkmnInfo.name;
    pkmnName = pkmnName.substring(0, 1).toUpperCase() + pkmnName.substring(1);
    const pkmnPic = pkmnInfo.sprites.front_default;
    const pkmnType = [];
    for (const type of pkmnInfo.types) {
        pkmnType.push(type.type.name);
    }
    // Ask the question
    const question = `What is \`${pkmnName}'s\` typing?`;
    message.channel.send(question, { files: [pkmnPic] });
    return pkmnType;
}

/**
 * Retrieves the guess for the question that was asked.
 *
 * @param {Discord.Message} message The message that invoked this command.
 *
 * @returns {Array}                 An array that represents what the user guessed.
 */
async function retrieveGuess(message) {
    // Await and process answer
    function filter(incMsg) {
        return incMsg.author === message.author;
    }
    const answerTimeout = {
        time: 30000,
        max: 1,
    };
    let guess = await message.channel.awaitMessages(filter, answerTimeout);
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
