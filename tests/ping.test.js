// Testing ping command
const ping = require('../commands/ping.js').execute;
const message = require('./mocks/discord_mock.js');

test('Testing ping command', () => {
    expect(1).toBe(2);
});
