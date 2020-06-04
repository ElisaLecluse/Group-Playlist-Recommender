import { Component, OnInit } from '@angular/core';
import {LoginService} from '../../../services/login.service';
import {PlaylistService} from '../../../services/playlist.service';
import {AudioService} from '../../../services/audio.service';
import {LoggingService} from '../../../services/logging.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-selecttop',
  templateUrl: './selecttop.component.html',
  styleUrls: ['./selecttop.component.css']
})
export class SelecttopComponent implements OnInit {

  songs = [];
  topsongs = [];
  lastsongs = [];
  max = 0;
  value;
  playing = null;

  constructor(private loginSvc: LoginService,
              private playlistSvc: PlaylistService,
              private audioSvc: AudioService,
              private loggingSvc: LoggingService,
              private router: Router) { }

  isPlaying(pre, id): boolean {
    if (this.playing === pre + id) {
      return true;
    }
    return false;
  }

  getUserColor(userid) {
    return this.loginSvc.getColor(userid);
  }

  getUserNameLike(userid) {
    return this.loginSvc.getUserNameLike(userid);
  }

  getPlayableColor(track) {
    return this.audioSvc.getColor(false, track.previewUrl);
  }

  playSong(pre, id, preview) {
    if (this.playing != null) {
      const otherSong = document.getElementById(this.playing) as HTMLAudioElement;
      if (otherSong) {
        otherSong.pause();
        this.playing = null;
        otherSong.src = '';
      }
    }
    if (preview) {
      const song = document.getElementById(pre + id) as HTMLAudioElement;
      song.src = preview;
      this.playing = pre + id;
      song.play();
      setTimeout(() => {
        if (this.isPlaying(pre, id)) {
          this.playing = null;
        }
      }, 30500);
    } else {
      window.open('https://open.spotify.com/track/' + id, '_blank');
    }
  }

  pauseSong(pre, id) {
    const song = document.getElementById(pre + id) as HTMLAudioElement;
    this.playing = null;
    song.pause();
    song.src = '';
  }

  sliceSongs(nb) {
    if (nb < 0) {
      nb = 0;
    }
    if (nb > this.max) {
      nb = this.max;
    }
    this.value = nb;
    this.topsongs = this.songs.slice(0, nb);
    this.lastsongs = this.songs.slice(nb, this.songs.length);
  }

  onClickNext() {
    this.loggingSvc.log('selecttop', {nb: this.value});
    this.router.navigate(['/final']);
  }

  ngOnInit(): void {
    this.loginSvc.setGroupMembers();
    this.loginSvc.getFlag().then((flag) => {
      this.playlistSvc.getFinalPlaylist(flag).then((data: any) => {
        for (const song of data.topsongs) {
          this.songs.push(song.track);
        }
        for (const song of data.lastsongs) {
          this.songs.push(song.track);
        }
        this.lastsongs = this.songs;
        this.max = this.songs.length;
      });
    });
  }

}
