module.exports = {
    name: 'help',
    description: 'Need more intel...',
    async execute(message, args) {
        message.channel.send('This is the output of the help command.');
    },
}