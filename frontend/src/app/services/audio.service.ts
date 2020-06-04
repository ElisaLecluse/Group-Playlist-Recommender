import { Injectable } from '@angular/core';
import {LoggingService} from './logging.service';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  playing = null;
  song = null;
  animation = {animation: 'none', 'animation-timing-function': 'none'};

  constructor(private logginSvc: LoggingService) { }

  isPlaying(id): boolean {
    if (this.playing === id) {
      return true;
    }
    return false;
  }

  getColor(added, preview) {
    if (preview) {
      return added ? '#84B8FF' : 'rgba(0, 0, 0, 0.5)';
    } else {
      return added ? 'rgba(132,184,255, 0.5)' : 'rgba(0, 0, 0, 0.2)';
    }
  }

  playSong(track, preview) {
    if (this.playing != null) {
      const otherSong = document.getElementById(this.playing) as HTMLAudioElement;
      if (otherSong) {
        otherSong.pause();
        this.playing = null;
        otherSong.src = '';
      }
    }
    if (preview) {
      const song = document.getElementById(track.id) as HTMLAudioElement;
      song.src = preview;
      this.playing = track.id;
      song.play();
      this.song = track;
      this.animate();
      setTimeout(() => {
        if (this.isPlaying(track.id)) {
          this.playing = null;
        }
      }, 30500);
      this.logginSvc.step2(false);
    } else {
      this.logginSvc.step2(true);
      window.open('https://open.spotify.com/track/' + track.id, '_blank');
    }
  }

  pauseSong(id) {
    const song = document.getElementById(id) as HTMLAudioElement;
    this.playing = null;
    song.pause();
    song.src = '';
  }

  animate() {
    this.animation = {animation: 'none', 'animation-timing-function': 'none'};
    setTimeout(() => {
      this.animation = {animation: 'translate 30550ms', 'animation-timing-function': 'linear'};
    }, 50);
  }

}
