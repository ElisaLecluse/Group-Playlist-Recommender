import { Component, OnInit } from '@angular/core';
import {PlaylistService} from '../../services/playlist.service';
import {AudioService} from '../../services/audio.service';
import {SocketService} from '../../services/socket.service';
import {LoginService} from '../../services/login.service';
import {SpotifyService} from '../../services/spotify.service';
import {LoggingService} from "../../services/logging.service";

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {

  constructor(private playlistSvc: PlaylistService,
              private audioSvc: AudioService,
              private socketSvc: SocketService,
              private loginSvc: LoginService,
              private spotifySvc: SpotifyService,
              private loggingSvc: LoggingService) { }

  log(action, details) {
    this.loggingSvc.log(action, details);
  }

  getSongs() {
    return this.playlistSvc.getGroupSongs();
  }

  addSongToPlaylist(song) {
    this.playlistSvc.addSong(song);
    this.log('like song', song);
    // this.spotifySvc.getRecommendations(song.id).then(data => this.spotifySvc.addRecommendedTracks(data));
  }

  removeSongFromPlaylist(song) {
    this.playlistSvc.removeSong(song);
    this.log('dislike song', song);
  }

  isPlaying(id): boolean {
    return this.audioSvc.isPlaying(id);
  }

  songAdded(song): boolean {
    return this.playlistSvc.userSelectedSong(song);
  }

  getUsers() {
    return this.loginSvc.users;
  }

  getUserColor(userid) {
    return this.loginSvc.getColor(userid);
  }

  getUserNameLike(userid) {
    return this.loginSvc.getUserNameLike(userid);
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
    const userid = localStorage.getItem('userid');
    const groupname = localStorage.getItem('groupname');
    this.socketSvc.listen('playlist').subscribe(
      (data: any) => {
        const tutorial = this.spotifySvc.getTutorial();
        if ((tutorial && data.version == 'Test')
          || !tutorial && data.version != 'Test') {
          if (groupname == data.groupname) {
            const songs = [];
            for (const song of data.playlist) {
              songs.push(song.track);
            }
            this.playlistSvc.setGroupSongs(songs);
            if (songs.length > 14) {
              this.playlistSvc.minPlaylist = true;
            }
          }
        }
      });
    this.socketSvc.listen('new user').subscribe(
      (data: any) => {
        if (data.groupname == groupname) {
          console.log('NEW USER: ', data);
          this.loginSvc.addUser(data.userid, data.username);
        }
      });
    // this.socketSvc.listen('song removed').subscribe(
    //   (data: any) => {
    //     if (data.groupname == groupname) {
    //       this.playlistSvc.updateRemovedSong(data.song.track, data.userid);
    //       console.log('SONG REMOVED: ', data);
    //     }
    //   });
    // this.socketSvc.listen('song added').subscribe(
    //   (data: any) => {
    //     if (data.groupname == groupname) {
    //       this.playlistSvc.updateAddedSong(data.song.track, data.userid);
    //       console.log(this.playlistSvc.getGroupSongs());
    //       console.log('SONG ADDED: ', data);
    //     }
    //   });
  }

}
