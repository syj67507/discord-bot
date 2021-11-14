import MusicManager, { Track } from "../../../v12_src/custom/music-manager";
import playCommand from "../../../v12_src/commands/music/play";
import { EventEmitter } from "events";

// jest.mock("../../../v12_src/custom/music-manager");

describe("Testing the play command", () => {
    describe("Testing the play command's run function", () => {
        let mm: MusicManager;
        const message: any = {
            reply: () => {
                return;
            },
            member: {
                voice: {
                    channel: {
                        join: () => {
                            client.emit(
                                "voiceStateUpdate",
                                voiceStateNull,
                                voiceStateConnected
                            );
                        },
                    },
                },
            },
        };
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
        beforeEach(() => {
            mm = MusicManager.getInstance(client);
        });

        it("should say that it is currently playing and stop execution", async () => {
            const args: any = {
                track: "",
            };

            const playingSpy = jest.spyOn(mm, "isPlaying").mockImplementation(() => true);
            const messageSpy = jest.spyOn(message, "reply");
            expect(true).toBe(true);
            expect(mm.isPlaying()).toBe(true);

            const result = await playCommand.run(message, args);
            expect(result).toBeNull();
            expect(messageSpy).toHaveBeenLastCalledWith(
                "I am currently playing... use next to skip to the next song"
            );

            playingSpy.mockRestore();
            messageSpy.mockRestore();
        });

        it("should stop execution if queue is empty and no track was provided", async () => {
            const args: any = {
                track: "",
            };

            const messageSpy = jest.spyOn(message, "reply");
            expect(true).toBe(true);
            expect(mm.isPlaying()).toBe(false);

            const result = await playCommand.run(message, args);
            expect(result).toBeNull();
            expect(messageSpy).toHaveBeenLastCalledWith("There is nothing to play.");

            messageSpy.mockRestore();
        });

        it("should add a track to the queue and play from a youtube link", async () => {
            const args: any = {
                track: "http://youtube.com/watch?v=asdfasdfasd",
            };

            const isPlayingSpy = jest.spyOn(mm, "isPlaying").mockImplementation(() => {
                return true;
            });
            const mmPlaySpy = jest.spyOn(mm, "play").mockImplementation(() => {
                return;
            });
            expect(true).toBe(true);
            expect(mm.isPlaying()).toBe(true);

            const result = await playCommand.run(message, args);
            expect(result).toBeNull();
            expect(mmPlaySpy).toHaveBeenLastCalledWith(message);

            mmPlaySpy.mockRestore();
            isPlayingSpy.mockRestore();
        });

        it("should add a track to the queue and play from a youtube search", async () => {
            const args: any = {
                track: "this is america",
            };

            const searchSpy = jest.spyOn(mm, "search").mockImplementation(() => {
                const track: Track = {
                    duration: "",
                    title: "",
                    link: "",
                };
                return track;
            });
            const mmPlaySpy = jest.spyOn(mm, "play").mockImplementation(() => {
                return;
            });
            expect(true).toBe(true);

            const result = await playCommand.run(message, args);
            expect(result).toBeNull();
            expect(mmPlaySpy).toHaveBeenLastCalledWith(message);

            mmPlaySpy.mockRestore();
            searchSpy.mockRestore();
        });
    });
});
