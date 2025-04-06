import { AudioResource } from "@discordjs/voice";

export class Track {
  title: string;
  duration: string;
  audioResource: AudioResource;

  constructor(title: string, duration: string, audioResource: AudioResource) {
    this.title = title;
    this.duration = duration;
    this.audioResource = audioResource;
  }
}
