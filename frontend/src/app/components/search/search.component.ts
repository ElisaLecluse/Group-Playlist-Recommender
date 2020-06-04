import { Component, OnInit } from '@angular/core';
import {SpotifyService} from '../../services/spotify.service';
import {PlaylistService} from '../../services/playlist.service';
import {AudioService} from '../../services/audio.service';
import {LoggingService} from '../../services/logging.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {

  private searchStr: string;
  private timeout;
  tracks;

  constructor(private spotifySvc: SpotifyService,
              private playlistSvc: PlaylistService,
              private audioSvc: AudioService,
              private loggingSvc: LoggingService) { }

  log(action, details) {
    this.loggingSvc.log(action, details);
  }

  searchMusic() {
    if (this.searchStr) {
      this.spotifySvc.searchMusic(this.searchStr).then(data => this.tracks = data);
      this.loggingSvc.step1();
    } else {
      this.tracks = [];
    }
  }

  onKey(event) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.searchStr = event.target.value;
      this.searchMusic();
    }, 300);
  }

  addSongToPlaylist(track) {
    this.playlistSvc.addSong(track);
    this.log('song added', track);
    this.loggingSvc.step3();
    // this.spotifySvc.getRecommendations(track.id).then(data => this.spotifySvc.addRecommendedTracks(data));
  }

  removeSongFromPlaylist(track) {
    this.playlistSvc.removeSong(track);
    this.log('song removed', track);
  }

  isPlaying(id): boolean {
    return this.audioSvc.isPlaying(id);
  }

  songAdded(track): boolean {
    return this.playlistSvc.userSelectedSong(track);
  }

  getColor(track) {
    return this.songAdded(track) ? '#84B8FF' : 'rgba(0, 0, 0, 0.4)';
  }

  getPlayableColor(track) {
    return this.audioSvc.getColor(this.songAdded(track), track.previewUrl);
  }

  getStyle(track) {
    return {
      color: this.songAdded(track) ? '#84B8FF' : 'rgba(0, 0, 0, 0.4)',
      background: this.songAdded(track) ? '#FFFFFF' : 'transparent'
    };
  }

  playSong(track, preview) {
    this.audioSvc.playSong(track, preview);
    this.log('play', track);
  }

  pauseSong(id) {
    this.audioSvc.pauseSong(id);
    this.log('pause', {trackid: id});
  }

  onClickSearch() {
    this.log('search', '');
  }

  ngOnInit() {
  }

}
