const Discord = require("discord.js");

// a counter so that all the ids are unique
let count = 0;

class Guild extends Discord.Guild {
    constructor(client) {
        super(client, {
            // you don't need all of these but I just put them in to show you all the properties that Discord.js uses
            id: count++,
            name: "",
            icon: null,
            splash: null,
            owner_id: "",
            region: "",
            afk_channel_id: null,
            afk_timeout: 0,
            verification_level: 0,
            default_message_notifications: 0,
            explicit_content_filter: 0,
            roles: [],
            emojis: [],
            features: [],
            mfa_level: 0,
            application_id: null,
            system_channel_id: null,
        });
        this.client.guilds.cache.set(this.id, this);
    }
}

class TextChannel extends Discord.TextChannel {
    constructor(guild) {
        super(guild, {
            id: count++,
            type: 0,
        });
        this.client.channels.cache.set(this.id, this);
    }

    // you can modify this for other things like attachments and embeds if you need
    send(content) {
        return this.client.actions.MessageCreate.handle({
            id: count++,
            type: 0,
            channel_id: this.id,
            content,
            author: {
                id: "bot id",
                username: "bot username",
                discriminator: "1234",
                bot: true,
            },
            pinned: false,
            tts: false,
            nonce: "",
            embeds: [],
            attachments: [],
            timestamp: Date.now(),
            edited_timestamp: null,
            mentions: [],
            mention_roles: [],
            mention_everyone: false,
        });
    }
}

class Message extends Discord.Message {
    constructor(content, channel, author) {
        super(
            channel.client,
            {
                id: count++,
                type: 0,
                channel_id: channel.id,
                content,
                author,
                pinned: false,
                tts: false,
                nonce: "",
                embeds: [],
                attachments: [],
                timestamp: Date.now(),
                edited_timestamp: null,
                mentions: [],
                mention_roles: [],
                mention_everyone: false,
            },
            channel
        );
    }
}

class MockDiscord {
    constructor() {
        const client = new Discord.Client();
        const guild = new Guild(client);
        const channel = new TextChannel(guild);
        return {
            client,
            channel,
        };
    }
}

module.exports = {
    MockDiscord,
    MockMessage: Message,
};
