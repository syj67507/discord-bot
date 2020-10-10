// Testing ping command
const ping = require('../commands/ping.js').execute;
const Message = require('./mocks/discord_mock.js');

test('Testing ping command', () => {
    expect(ping(new Message(), [])).resolves.toBeUndefined();
    expect(ping(null, [])).rejects.toThrow();
});
