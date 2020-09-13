module.exports = {
    name: 'pokemon',
    description: 'Pokemon Trivia!',
    async execute(message, args) {
        message.channel.send('Currently under maintenance, sorry...');
        return;
        const Pokedex = require('pokedex-promise-v2');
        const pokeClient = new Pokedex();
        // Returns an object representing the random pokemon
        if (args.length == 1 && args[0] === 'type') {
            pokeClient.getPokemonsList()
                .then((res) => {
                    // Get info for question
                    let apiUrl = 'https://pokeapi.co';
                    randomIndex = Math.floor(Math.random() * res.count);
                    randomPokemon = res.results[randomIndex].name;
                    pokeClient.getPokemonByName(randomPokemon, (res, err) => {
                        pokemonName = res.name.substring(0,1).toUpperCase() + res.name.substring(1);
                        pokemonPic = res.sprites.front_default;
                        pokemonType = [];
                        res.types.forEach((type) => {
                            pokemonType.push(type.type.name);
                        });

                        // Ask the question
                        let question = `What is ${pokemonName}'s typing?`;
                        message.channel.send(question, {files: [pokemonPic]});
                        // message.channel.send('Answer: ' + pokemonType);

                        getAnswer();
                        async function getAnswer() {
                            try {
                                // Get an answer
                                let filter = m => m.content.startsWith('!answer');
                                let answerTimeout = {
                                    time: 30000,
                                    max: 1,
                                    errors: ['time']
                                }
                                let response = await message.channel.awaitMessages(filter, answerTimeout);
                                let answer = response.first().content.split(' ');
                                answer.shift();

                                // Process the answer
                                let correct = true;
                                if (answer.length != pokemonType.length) {
                                    correct = false;
                                }
                                for (const type of pokemonType) {
                                    if (!answer.includes(type)) {
                                        correct = false;
                                    }
                                }
                                if (correct) {
                                    message.channel.send('Congratulations! You got it right!');
                                }
                                else {
                                    message.channel.send('Sorry, you didn\'t get it right :(\n' +
                                                         'The correct answer is ' + pokemonType);
                                }

                            }
                            catch (err) {
                                message.channel.send('You didn\'t answer in time :slight_frown:');
                                message.channel.send('The answer was ' + pokemonType);
                            }
                        }
                    })
                    .catch((err) => {
                        message.channel.send('Sorry... there was an error trying to catch a pokemon question :(');
                    });
                })
                .catch((err) => {
                    message.channel.send('Sorry... there was an error trying to catch a pokemon question :(');
                });
        }
        else if (args.length == 1 && args[0] === 'gen') {
            pokeClient.getGenerationsList()
                .then((res) => {
                    // Get info for question
                    let numGen = res.count;
                    let rIndex = Math.floor(Math.random() * numGen);
                    let rGen = res.results[rIndex].name;
                    pokeClient.getGenerationByName(rGen)
                        .then((res) => {
                            res = res.pokemon_species;
                            rPkmn = res[Math.floor(Math.random() * res.length)];
                            console.log(rPkmn, rGen);

                            // Ask the question
                            message.channel.send(`When generation was ${rPkmn.name} introduced?`);

                            getAnswer();
                            async function getAnswer() {
                                const filter = m => m.content.startsWith('!a');
                                let answer = await message.channel.awaitMessages(filter, {
                                    max: 4,
                                    time: 60000,
                                    errors: ['time']
                                });
                            }

                        })
                        .catch((err) => {
                            message.channel.send('Sorry... there was an error trying to get the pokemon generation list :(');
                        });
                })
                .catch((err) => {
                    message.channel.send('Sorry... there was an error trying to get a random Pokemon generation :(');
                });
        }
        else {
            message.channel.send('You didn\'t give me a category :slight_frown:');
        }
    }
}
