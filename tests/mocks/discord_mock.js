class Channel {
    constructor() {}
    send() {}
}
class Message {
    constructor() {
        this.channel = new Channel();
    }
}
