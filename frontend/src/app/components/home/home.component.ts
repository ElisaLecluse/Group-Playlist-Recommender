import {Component, Inject, OnInit} from '@angular/core';
import {LoginService} from '../../services/login.service';
import {SocketService} from '../../services/socket.service';
import {PlaylistService} from '../../services/playlist.service';
import {SpotifyService} from '../../services/spotify.service';
import {Router} from '@angular/router';
import {AudioService} from '../../services/audio.service';
import {LoggingService} from '../../services/logging.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';

export interface DialogData {
  slc: boolean;
  playlist: boolean;
  members: any;
  trigger: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  minSelected = false;
  names = [];
  trigger = false;

  constructor(private loginSvc: LoginService,
              private socketSvc: SocketService,
              private playlistSvc: PlaylistService,
              private spotifySvc: SpotifyService,
              private audioSvc: AudioService,
              private loggingSvc: LoggingService,
              public dialog: MatDialog) { }

  openDialog(): void {
    this.dialog.open(TaskDialogComponent, {
      autoFocus: false,
      data: {slc: this.minSelected, playlist: this.getMinPlaylist(), members: this.names, trigger: this.trigger}
    });
  }

  onClickFinish() {
    this.loggingSvc.log('finished-btn', {minSelected: this.minSelected, slc: this.spotifySvc.getSelected().length,
      playlist: this.playlistSvc.getGroupSongs().length, minPlaylist: this.getMinPlaylist()});
    if (!this.minSelected || !this.getMinPlaylist()) {
      this.openDialog();
    } else {
      this.names = [];
      this.playlistSvc.getNbSlcPerMember().then((slc: any) => {
        for (const user of slc) {
          if (user.nbslc < 5) {
            this.names.push(user.name);
          }
        }
        if (this.names.length) {
          this.openDialog();
        } else {
          this.socketSvc.emit('user left', {groupname: localStorage.getItem('groupname')});
          this.trigger = true;
          this.openDialog();
        }
      });
    }
  }

  getAnimation() {
    return this.audioSvc.animation;
  }

  getTrackTitle() {
    if (this.audioSvc.song) {
      return this.audioSvc.song.name + ' - ' + this.audioSvc.song.artists;
    }
    return '';
  }

  getPlayableColor() {
    if (this.audioSvc.song) {
      return this.audioSvc.song.previewUrl ? 'white' : 'rgba(255, 255, 255, 0.5';
    } else {
      return 'rgba(255, 255, 255, 0.5';
    }
  }

  playSong() {
    this.audioSvc.playSong(this.audioSvc.song, this.audioSvc.song.previewUrl);
    this.loggingSvc.log('play footer', this.audioSvc.song);
  }

  pauseSong() {
    this.audioSvc.pauseSong(this.audioSvc.song.id);
    this.loggingSvc.log('pause footer', {trackid: this.audioSvc.song.id});
  }

  getMinPlaylist() {
    return this.playlistSvc.minPlaylist;
  }

  isPlaying() {
    return !!this.audioSvc.playing;
  }

  isSelected() {
    return !!this.audioSvc.song;
  }

  ngOnInit(): void {
    console.log('*** Home ***');
    const userid = localStorage.getItem('userid');
    const groupname = localStorage.getItem('groupname');
    this.socketSvc.emit('init', {userid: userid, groupname: groupname, tutorial: false});
    this.socketSvc.listen('init').subscribe(
      (data: any) => {
        if (groupname == data.groupname) {
          const songs = [];
          for (const song of data.playlist) {
            songs.push(song.track);
          }
          console.log('Playlist: ', songs);
          if (songs.length > 14) {
            this.playlistSvc.minPlaylist = true;
          }
          this.playlistSvc.setGroupSongs(songs);
          this.spotifySvc.setUserRecommendations(data.userrec);
          this.spotifySvc.setGroupRecommendations((data.grouprec));
        }
      });
    this.loginSvc.setGroupMembers();
    this.spotifySvc.requestSelected().then((trackids: any) => {
      if (trackids) {
        if (trackids.length > 4) {
          this.minSelected = true;
        }
      }
    });
    this.spotifySvc.userrecCount = 0;
    this.spotifySvc.grouprecCount = 0;
    this.loggingSvc.log('app entered', '');

    this.socketSvc.listen('5 selected').subscribe(
      (data: any) => {
        if (userid == data.userid) {
          this.minSelected = true;
        }
      }
    );
    this.socketSvc.listen('5 not selected').subscribe(
      (data: any) => {
        if (userid == data.userid) {
          this.minSelected = false;
        }
      }
    );
    this.socketSvc.listen('user left').subscribe(
      (data: any) => {
        if (groupname == data.groupname) {
          this.trigger = true;
          this.openDialog();
        }
      }
    );
    this.socketSvc.listenForDisconnect();
  }


}

@Component({
  selector: 'app-task-dialog',
  templateUrl: 'task-dialog.html',
})
export class TaskDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
              private loggingSvc: LoggingService,
              private loginSvc: LoginService,
              private router: Router) {}

  onClickLeave() {
    this.loggingSvc.log('left app', '');
    this.router.navigate(['/fairness']);
  }
}
