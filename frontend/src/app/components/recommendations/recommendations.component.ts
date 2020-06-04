import {Component, Input, OnInit} from '@angular/core';
import {PlaylistService} from '../../services/playlist.service';
import {AudioService} from '../../services/audio.service';
import {SpotifyService} from '../../services/spotify.service';
import {LoggingService} from '../../services/logging.service';

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css']
})
export class RecommendationsComponent implements OnInit {
  @Input('parent') parent: string;

  constructor(private playlistSvc: PlaylistService,
              private audioSvc: AudioService,
              private spotifySvc: SpotifyService,
              private loggingSvc: LoggingService) { }

  log(action, details) {
    this.loggingSvc.log(action, details);
  }

  getRecommendedTracks(parent) {
    if (parent == 'your') {
      return this.spotifySvc.getUserRecommendations();
    }
    if (parent == 'group') {
      return this.spotifySvc.getGroupRecommendations();
    }
    // return this.spotifySvc.getUserRecommendations();
  }

  addSongToPlaylist(song, parent) {
    this.playlistSvc.addSong(song);
    this.log(parent + ' song added', song);
    // this.spotifySvc.getRecommendations(song.id).then(data => this.spotifySvc.addRecommendedTracks(data));
  }

  removeSongFromPlaylist(song, parent) {
    this.playlistSvc.removeSong(song);
    this.log(parent + ' song removed', song);
  }

  isPlaying(id): boolean {
    return this.audioSvc.isPlaying(id);
  }

  songAdded(song): boolean {
    return this.playlistSvc.userSelectedSong(song);
  }

  getColor(track) {
    return this.songAdded(track) ? '#84B8FF' : 'rgba(0, 0, 0, 0.4)';
  }

  getPlayableColor(track) {
    return this.audioSvc.getColor(this.songAdded(track), track.previewUrl);
  }

  getStyle(song) {
    return {
      color: this.songAdded(song) ? '#84B8FF' : 'rgba(0, 0, 0, 0.4)',
      background: this.songAdded(song) ? '#FFFFFF' : 'transparent'
    };
  }

  playSong(song, preview) {
    this.audioSvc.playSong(song, preview);
    this.log('play', song);
  }

  pauseSong(id) {
    this.audioSvc.pauseSong(id);
    this.log('pause', {trackid: id});
  }

  ngOnInit(): void {

  }

}
