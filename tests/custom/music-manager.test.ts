// module mocks
const validMockGetInfoLink = "https://www.youtube.com/watch?v=a1s2d3f4g5h";
const invalidMockGetInfoLink = "https://www.youtube.com/watch?v=u1v2w3x4y5z";
jest.mock("ytdl-core", () => {
    const ytdl = () => {
        // empty
    };
    ytdl.getInfo = (link: string) => {
        if (link === validMockGetInfoLink) {
            const info = {
                videoDetails: {
                    lengthSeconds: 134,
                    video_url: link,
                    title: "Test YouTube Title",
                },
            };
            return info;
        } else if (link === invalidMockGetInfoLink) {
            throw new Error(`Invalid mock getInfo link: ${link}`);
        } else {
            return "Unknown link: " + link;
        }
    };
    return ytdl;
});
import { EventEmitter } from "events";
import MusicManager, { Track } from "../../v12_src/custom/music-manager";

describe("Testing the MusicManager class", () => {
    const client: any = new EventEmitter();
    const voiceChannel: any = {
        join: () => {
            client.emit("voiceStateUpdate", voiceStateNull, voiceStateConnected);
        },
        leave: () => {
            client.emit("voiceStateUpdate", voiceStateConnected, voiceStateNull);
        },
    };
    const dispatcher = {
        on() {
            // empty
        },
    };

    const voiceStateConnected: any = {
        member: {
            user: {
                bot: true,
            },
        },
        channel: voiceChannel,
        connection: {
            play() {
                return dispatcher;
            },
        },
    };
    const voiceStateNull: any = {
        member: {
            user: {
                bot: true,
            },
        },
        channel: null,
        connection: null,
    };
    const mm = MusicManager.getInstance(client);
    const message: any = {
        channel: {
            send: () => {
                // empty
            },
        },
        reply: () => {
            // empty
        },
    };
    beforeEach(() => {
        client.emit("voiceStateUpdate", voiceStateConnected, voiceStateNull);
        mm.playlist = [];
        jest.clearAllMocks();
        // jest.restoreAllMocks();
    });

    it("should return an instance of the MusicManager", () => {
        expect(mm).toBeInstanceOf(MusicManager);
    });

    it("should throw an error if joining threw an error", async () => {
        const joinSpy = jest.spyOn(voiceChannel, "join").mockImplementation(async () => {
            throw new Error();
        });

        await expect(mm.connect(voiceChannel)).rejects.toThrow();
        joinSpy.mockRestore();
    });

    it("should be able to connect to a voice channel", async () => {
        const joinSpy = jest.spyOn(voiceChannel, "join");

        await mm.connect(voiceChannel);
        expect(joinSpy).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if the voice channel is null", async () => {
        const vChannel = null;

        return expect(mm.connect(vChannel)).rejects.toThrow(
            "Unable to join voice channel"
        );
    });

    it("should disconnect from the voice channel", async () => {
        const joinSpy = jest.spyOn(voiceChannel, "join");
        const leaveSpy = jest.spyOn(voiceChannel, "leave");
        await mm.connect(voiceChannel);

        mm.disconnect();

        expect(joinSpy).toHaveBeenCalledTimes(1);
        expect(leaveSpy).toHaveBeenCalledTimes(1);
    });

    it("should add a track to the playlist", () => {
        const tracks: Track[] = [];
        for (let i = 0; i < 3; i++) {
            tracks.push({
                title: `[${i}]Track Title`,
                duration: "00:00",
                link: `test.com/link/${i}`,
            });
        }
        expect(mm.playlist).toEqual([]);
        expect(mm.playlist).toHaveLength(0);

        mm.queue(tracks[0]);
        expect(mm.playlist).toEqual([tracks[0]]);
        expect(mm.playlist).toHaveLength(1);

        mm.queue(tracks[1]);
        expect(mm.playlist).toEqual([tracks[0], tracks[1]]);
        expect(mm.playlist).toHaveLength(2);

        mm.queue(tracks[2], 0);
        expect(mm.playlist).toEqual([tracks[2], tracks[0], tracks[1]]);
        expect(mm.playlist).toHaveLength(3);

        mm.queue(tracks[1], 1);
        expect(mm.playlist).toEqual([tracks[2], tracks[1], tracks[0], tracks[1]]);
        expect(mm.playlist).toHaveLength(4);
    });

    it("should return the correct queue length", () => {
        const track: Track = {
            title: "Track Title",
            duration: "00:00",
            link: "test.com/link",
        };

        expect(mm.queueLength()).toBe(0);

        mm.queue(track);
        expect(mm.queueLength()).toBe(1);

        mm.queue(track);
        expect(mm.queueLength()).toBe(2);

        mm.queue(track, 0);
        expect(mm.queueLength()).toBe(3);

        mm.queue(track, 99);
        expect(mm.queueLength()).toBe(4);
    });

    it("should clear the queue", () => {
        // queue some tracks into the playlist
        for (let i = 0; i < 3; i++) {
            mm.queue({
                title: `[${i}]Track Title`,
                duration: "00:00",
                link: `test.com/link/${i}`,
            });
        }

        expect(mm.playlist).toHaveLength(3);
        mm.clearQueue();
        expect(mm.playlist).toHaveLength(0);
    });

    // it("should say that the manager is not currently playing", () => {
    //     mm.disconnect();
    //     expect(mm.isPlaying()).toBe(false);
    // });

    it("should return that it is a youtube link", () => {
        const validYTLinks = [
            "https://youtube.com/watch?v=a1s2d3f4g5h",
            "https://youtu.be/a1s2d3f4g5h",
            "http://youtube.com/watch?v=a1s2d3f4g5h",
            "http://youtu.be/a1s2d3f4g5h",
            "youtube.com/watch?v=a1s2d3f4g5h",
            "youtu.be/a1s2d3f4g5h",
            "https://www.youtube.com/watch?v=a1s2d3f4g5h",
            "https://www.youtu.be/a1s2d3f4g5h",
            "http://www.youtube.com/watch?v=a1s2d3f4g5h",
            "http://www.youtu.be/a1s2d3f4g5h",
            "www.youtube.com/watch?v=a1s2d3f4g5h",
            "www.youtu.be/a1s2d3f4g5h",
        ];
        for (const link of validYTLinks) {
            const result = mm.isYTLink(link);
            expect(result).toBe(true);
        }
    });

    it("should return that it is not a youtube link", () => {
        const invalidYTLinks = [
            "https://youtube.com/watch?v=a1s2d3f4g5h234123",
            "https://youtu.be/a1s2d3f-&4g5h",
            "google.com/watch?v=a1s2d3f4g5h",
            "https://youtube.com/a1s2d3f4g5h",
        ];
        for (const link of invalidYTLinks) {
            const result = mm.isYTLink(link);
            expect(result).toBe(false);
        }
    });

    it("should create a track object from the YouTube link", async () => {
        const result = await mm.createTrackFromYTLink(validMockGetInfoLink);
        expect(result).toEqual({
            duration: "2:14",
            link: validMockGetInfoLink,
            title: "Test YouTube Title",
        });
    });

    it("should create a track object from the YouTube link", async () => {
        const validMockGetInfoSharedLink = validMockGetInfoLink.replace(
            "youtube.com/watch?v=",
            "youtu.be/"
        );
        const result = await mm.createTrackFromYTLink(validMockGetInfoSharedLink);
        expect(result).toEqual({
            duration: "2:14",
            link: validMockGetInfoLink,
            title: "Test YouTube Title",
        });
    });

    it(
        "should create an empty track object from the" +
            "YouTube link on failure to fetch video details",
        async () => {
            const result = await mm.createTrackFromYTLink(invalidMockGetInfoLink);
            expect(result).toEqual({
                duration: "00:00",
                link: invalidMockGetInfoLink,
                title: "title not available",
            });
        }
    );

    it("should throw an error if the link is not a YouTube link", async () => {
        const notAYouTubeLink = "https://google.com/watch";
        const result = mm.createTrackFromYTLink(notAYouTubeLink);
        expect(result).rejects.toThrow(
            `MusicManagerError: The link ${notAYouTubeLink} is not a youtube link.`
        );
    });

    it("should successfully setup a dispatcher on play", async () => {
        client.emit("voiceStateUpdate", voiceStateNull, voiceStateConnected);
        mm.queue({
            duration: "0",
            link: "hello",
            title: "title",
        });
        const dispatcherSpy = jest.spyOn(dispatcher, "on");
        mm.play(message);
        expect(dispatcherSpy.mock.calls).toHaveLength(3);
    });

    it("should throw error if the client is not connected", async () => {
        expect(() => {
            mm.play(message);
        }).toThrow("Music Manager not connected. Must be connected in order to play");
    });

    it("should throw error if the playlist is empty", async () => {
        client.emit("voiceStateUpdate", voiceStateNull, voiceStateConnected);
        expect(() => {
            mm.play(message);
        }).toThrow("Queue is empty.");
    });
});
