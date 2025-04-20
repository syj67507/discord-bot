import { AudioResource } from "@discordjs/voice";

export class Track {
  title: string;
  duration: string;
  url: string;
  author: string;
  audioResource: AudioResource;
  image: string;

  constructor(trackOptions: {
    title?: string;
    duration?: string;
    url?: string;
    author?: string;
    audioResource: AudioResource;
    image: string;
  }) {
    this.title = trackOptions.title || "Unknown";
    this.duration = trackOptions.duration || "Unknown";
    this.url = trackOptions.url || "Unknown";
    this.author = trackOptions.author || "Unknown";
    this.audioResource = trackOptions.audioResource;
    this.image = trackOptions.image;
  }
}
