const { MockDiscord, MockMessage } = require('./mocks/MockDiscord.js');
const revive = require('../commands/revive.js').execute;
const UsageError = require('../custom_errors/usage_error.js');

// setting up the Discord mock
const mock = new MockDiscord();
const user = { id: 9, username: 'username', discriminator: '1234' };

afterAll(() => {
    mock.client.destroy();
});

test('Testing command call with no arguments', () => {
    const msg = `${process.env.PREFIX}revive`;
    expect(
        revive(new MockMessage(msg, mock.channel, user), [])
    ).rejects.toThrow(UsageError);
});

test('Testing command call with no mentions', () => {
    const msg = `${process.env.PREFIX}revive`;
    expect(
        revive(new MockMessage(msg, mock.channel, user), [])
    ).rejects.toThrow(UsageError);
});
