import ytsr from "ytsr";
import ytdl, { videoInfo } from "ytdl-core";
import { YTClient, ytsrWrapper, ytplWrapper } from "../../src/custom/ytclient";
import ytpl from "ytpl";

describe("YTClient tests", () => {
    const yt = new YTClient();

    describe("getVideo tests", () => {
        const mockedYTDLResponse = {
            videoDetails: {
                title: "Test Title",
                video_url: "https://youtube.com/watch?v=nMVFSwfV6wk",
                lengthSeconds: "138",
            },
        } as videoInfo;

        beforeEach(() => {
            jest.restoreAllMocks();
            jest.spyOn(ytdl, "getBasicInfo").mockImplementation(async () => {
                return mockedYTDLResponse;
            });
        });

        it("should successfully return a track from the direct link", async () => {
            const result = await yt.getVideo("https://youtube.com/watch?v=nMVFSwfV6wk");
            expect(result).toEqual({
                title: "Test Title",
                link: "https://youtube.com/watch?v=nMVFSwfV6wk",
                duration: "00:02:18",
            });
        });

        it("should successfully return a track from the video ", async () => {
            const result = await yt.getVideo("https://youtube.com/watch?v=nMVFSwfV6wk");
            expect(result).toEqual({
                title: "Test Title",
                link: "https://youtube.com/watch?v=nMVFSwfV6wk",
                duration: "00:02:18",
            });
        });

        it("should throw an error if the provided link is invalid", async () => {
            const result = yt.getVideo("https://youtube.com/invalidlink");
            await expect(result).rejects.toThrow();
        });
    });

    describe("search tests", () => {
        beforeEach(() => {
            jest.restoreAllMocks();
            // Mock the ytsr library
            jest.spyOn(ytsrWrapper, "ytsr").mockReturnValue(
                Promise.resolve({
                    items: [
                        {
                            title: "Test Title",
                            url: "https://youtube.com/watch?v=nMVFSwfV6wk",
                            duration: "2:18",
                        } as ytsr.Video,
                    ],
                } as ytsr.Result)
            );
            jest.spyOn(ytsrWrapper, "getFilters").mockImplementation(async () => {
                const m = new Map<string, Map<string, ytsr.Filter>>();
                const m2 = new Map<string, ytsr.Filter>();
                m2.set("Video", {
                    url: "https://youtube.filter/",
                } as ytsr.Filter);
                m.set("Type", m2);
                return m;
            });
        });

        it("should successfully return a track from a search", async () => {
            const result = await yt.search("test");
            expect(result).toEqual({
                title: "Test Title",
                link: "https://youtube.com/watch?v=nMVFSwfV6wk",
                duration: "2:18",
            });
        });

        it("should throw an error when the getFilters call throws an error", async () => {
            jest.spyOn(ytsrWrapper, "getFilters").mockImplementation(async () => {
                throw new Error();
            });

            const result = yt.search("test");
            await expect(result).rejects.toThrow();
        });

        it("should throw an error when the getFilters call return unexpected response", async () => {
            jest.spyOn(ytsrWrapper, "getFilters").mockImplementation(async () => {
                const m = new Map<string, Map<string, ytsr.Filter>>();
                m.set("Invalid Type", new Map<string, ytsr.Filter>());
                return m;
            });

            const result = yt.search("test");
            await expect(result).rejects.toThrow();
        });

        it("should throw an error when the search call returns an error", async () => {
            jest.spyOn(ytsrWrapper, "ytsr").mockImplementation(async () => {
                throw new Error();
            });

            const result = yt.search("test");
            await expect(result).rejects.toThrow();
        });
    });

    describe("getPlaylist tests", () => {
        const playlistLink =
            "https://www.youtube.com/playlist?list=PLj1VgFJQaymTo8cYjAiDl9c_nQuwUo2Dx";
        beforeEach(() => {
            jest.restoreAllMocks();
            jest.spyOn(ytplWrapper, "getPlaylistID").mockImplementation(async () => {
                return "PLj1VgFJQaymTo8cYjAiDl9c_nQuwUo2Dx";
            });
            jest.spyOn(ytplWrapper, "ytpl").mockImplementation(async () => {
                const response = {
                    items: [
                        {
                            title: "Test Title",
                            url: "https://youtube.com/watch?v=nMVFSwfV6wk",
                            duration: "2:18",
                        },
                    ],
                } as ytpl.Result;
                return response;
            });
        });

        it("should successfully return a Track[]", async () => {
            const result = await yt.getPlaylist(playlistLink);
            expect(result).toEqual([
                {
                    duration: "2:18",
                    link: "https://youtube.com/watch?v=nMVFSwfV6wk",
                    title: "Test Title",
                },
            ]);
        });
    });
});
