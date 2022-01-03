export class Messages {
    static MODE = "basic";

    get(messageIdentifier: string): string {
        return msgConfig[messageIdentifier][Messages.MODE];
    }

    setMODE(personalityName: string): void {
        Messages.MODE = personalityName;
    }
}

const msgConfig: { [key: string]: any } = {
    meow: {
        basic: "Meow!",
        brandon: "meow bruh",
    },
    pubsubOnSale: {
        basic: "The publix chicken tender sandwich is on sale.",
        brandon: "ITS ON SALE LETS GOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO",
    },
    pubsubNotOnSale: {
        basic: "The Publix chicken tender sandwich is NOT on sale.",
        brandon: "bruh the sandwich not on sale",
    },
};
