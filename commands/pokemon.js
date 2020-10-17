const Pokedex = require("pokedex-promise-v2");
const pokeClient = new Pokedex();

module.exports = {
    name: "pokemon",
    description: "Pokemon Trivia Game!",
    usage: `
        ${process.env.PREFIX}pokemon
        `,
    async execute(message, args) {
        // Fetch a random pokemon
        const pkmnList = await pokeClient.getPokemonsList();
        const rdx = Math.floor(Math.random() * pkmnList.count);
        let pkmnName = pkmnList.results[rdx].name;

        // Fetch the random pokemon's information
        const pkmnInfo = await pokeClient.getPokemonByName(pkmnName);
        pkmnName =
            pkmnName.substring(0, 1).toUpperCase() + pkmnName.substring(1);
        const pkmnPic = pkmnInfo.sprites.front_default;
        const pkmnType = [];
        for (const type of pkmnInfo.types) {
            pkmnType.push(type.type.name);
        }
        console.log("Answer:", pkmnType);

        // Ask the question
        const question = `What is \`${pkmnName}'s\` typing?`;
        message.channel.send(question, { files: [pkmnPic] });

        // Await and process answer
        const filter = (m) => m.author === message.author;
        const answerTimeout = {
            time: 30000,
            max: 1,
            errors: ["time"],
        };
        let guess = await message.channel.awaitMessages(filter, answerTimeout);
        guess = guess.first().content.split(/[ ]+/);
        console.log("Guess: ", guess);

        // Verify answer
        let correct = false;
        if (guess.length == pkmnType.length) {
            if (
                JSON.stringify(guess.sort()) === JSON.stringify(pkmnType.sort())
            ) {
                correct = true;
            }
        }
        if (correct) {
            message.channel.send("That's correct!");
        } else {
            message.channel.send([
                "Sorry, that's incorrrect.",
                `The correct answer is ${pkmnType}`,
            ]);
        }
    },
};
