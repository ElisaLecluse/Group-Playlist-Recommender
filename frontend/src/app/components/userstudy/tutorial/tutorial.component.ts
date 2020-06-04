import {Component, Inject, OnInit} from '@angular/core';
import {LoginService} from '../../../services/login.service';
import {SocketService} from '../../../services/socket.service';
import {PlaylistService} from '../../../services/playlist.service';
import {SpotifyService} from '../../../services/spotify.service';
import {AudioService} from '../../../services/audio.service';
import {LoggingService} from '../../../services/logging.service';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})
export class TutorialComponent implements OnInit {

  start = false;

  constructor(private loginSvc: LoginService,
              private socketSvc: SocketService,
              private playlistSvc: PlaylistService,
              private spotifySvc: SpotifyService,
              private audioSvc: AudioService,
              private loggingSvc: LoggingService,
              private router: Router,
              public dialog: MatDialog,
              public http: HttpClient) { }

  openDialog(): void {
    const d = this.dialog.open(TutorialDialogComponent, {
      autoFocus: false
    });
    d.afterClosed().subscribe(() => {
      this.start = true;
      document.getElementById('step1').style.visibility = 'visible';
    });
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
  }

  pauseSong() {
    this.audioSvc.pauseSong(this.audioSvc.song.id);
  }

  isPlaying() {
    return !!this.audioSvc.playing;
  }

  isSelected() {
    return !!this.audioSvc.song;
  }

  getSemiTrigger() {
    return this.loggingSvc.flag3;
  }

  getFlag5() {
    return this.loggingSvc.flag5;
  }

  onClickRefreshed() {
    document.getElementById('step5').style.visibility = 'hidden';
    document.getElementById('step6').style.visibility = 'visible';
  }

  onClickStep6() {
    if (!this.loggingSvc.flag6 && this.loggingSvc.flag5) {
      document.getElementById('step6').style.visibility = 'hidden';
      document.getElementById('step7').style.visibility = 'visible';
      this.loggingSvc.addFlag(6);
      this.loggingSvc.flag6 = true;
    }
  }

  onClickFinish() {
    if (this.loggingSvc.flag5) {
      this.router.navigate(['/task']);
      this.resetTrackattr();
    }
  }

  resetTrackattr() {
    return new Promise((resolve, reject) => {
      this.http.get(this.loggingSvc.backendUrl + '/login/reset-trackattr?userid='
        + localStorage.getItem('userid')).subscribe(
        (msg) => resolve(msg), () => reject());
    });
  }

  saveTut(userid) {
    return new Promise((resolve, reject) => {
      this.http.get(this.loggingSvc.backendUrl + '/log/add-tut?userid=' + userid).subscribe(
        (msg) => {resolve(msg); }, () => {reject(); });
    });
  }

  checkFlags(userid) {
    return new Promise ((resolve, reject) => {
      this.saveTut(userid).then(() => {
        this.http.get(this.loggingSvc.backendUrl + '/log/get-tutflags?userid=' + userid).subscribe((flags: any) => {
          console.log(flags);
          this.loggingSvc.flag1 = flags.flag1;
          this.loggingSvc.flag2 = flags.flag2;
          this.loggingSvc.flag3 = flags.flag3;
          this.loggingSvc.flag4 = flags.flag4;
          this.loggingSvc.flag5 = flags.flag5;
          this.loggingSvc.flag6 = flags.flag6;
          if (flags.flag6) {
            this.loggingSvc.flag3 = true;
            document.getElementById('step7').style.visibility = 'visible';
          } else if (flags.flag5) {
            this.loggingSvc.flag3 = true;
            document.getElementById('step6').style.visibility = 'visible';
          } else if (flags.flag4) {
            this.loggingSvc.flag3 = true;
            document.getElementById('step5').style.visibility = 'visible';
          } else if (flags.flag3) {
            document.getElementById('step4').style.visibility = 'visible';
          } else if (flags.flag2) {
            this.start = true;
            document.getElementById('step3').style.visibility = 'visible';
          } else if (flags.flag1) {
            this.start = true;
            console.log(this.loggingSvc.flag1);
            document.getElementById('step2').style.visibility = 'visible';
          }
          resolve(flags.flag1);
        }, () => {});
      });
    });
  }

  ngOnInit(): void {
    console.log('*** Tutorial ***');
    this.loggingSvc.log('tut entered', '');
    const userid = localStorage.getItem('userid');
    const groupname = localStorage.getItem('groupname');
    this.checkFlags(userid).then((flag1) => {
      if (!flag1) {
        this.openDialog();
      }
      this.socketSvc.emit('init', {userid: userid, groupname: groupname, tutorial: true});
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
      this.spotifySvc.userrecCount = 0;
      this.spotifySvc.grouprecCount = 0;
      this.loginSvc.setGroupMembers();
      this.spotifySvc.requestSelected();
    });
    this.socketSvc.listenForDisconnect();
  }


}

@Component({
  selector: 'app-tutorial-dialog',
  templateUrl: 'tutorial-dialog.html',
})
export class TutorialDialogComponent {

  constructor() {}
}
