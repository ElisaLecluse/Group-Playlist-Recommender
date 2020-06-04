import { Injectable } from '@angular/core';
import {GroupSong} from '../models/groupsong.model';
import {SpotifyService} from './spotify.service';
import {SocketService} from './socket.service';
import {HttpClient} from '@angular/common/http';
import {LoginService} from './login.service';
import {LoggingService} from './logging.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

  private songs = [];
  private userid = localStorage.getItem('userid');
  minPlaylist = false;

  constructor(private spotifySvc: SpotifyService,
              private loginSvc: LoginService,
              private socketSvc: SocketService,
              private loggingSvc: LoggingService,
              private http: HttpClient) { }

  userSelectedSong(song): boolean {
    for (const s of this.songs) {
      if (s.id == song.id) {
        return s.userids.includes(this.userid);
      }
    }
    return false;
  }

  addSong(song) {
    for (const s of this.songs) {
      if (s.id == song.id) {
        if (!s.userids.includes(this.userid)) {
          s.userids.push(this.userid);
          this.socketSvc.emit('add song', this.songToGroupSong(song));
        } else {
          console.error('User already selected this song: ' + song);
        }
        return;
      }
    }
    if (!song.userids.includes(this.userid)) {
      song.userids.push(this.userid);
    }
    this.spotifySvc.addSelected(song.id);
    this.songs.push(song);
    if (this.songs.length > 14) {
      this.minPlaylist = true;
    }
    this.socketSvc.emit('add song', this.songToGroupSong(song));
    setTimeout(() => {
      document.getElementById(song.id + 'list').style.animation = 'addinit, addchange 4s ease-in 0s, 1.9s';
    }, 1000);
  }

  removeSong(song) {
    let i = -1;
    for (const s of this.songs) {
      i++;
      if (s.id == song.id) {
        const index = s.userids.indexOf(this.userid);
        if (index > -1) {
          if (s.userids.length > 1) {
            s.userids.splice(index, 1);
          } else {
            this.songs.splice(i, 1);
          }
          this.spotifySvc.removeSelected(song.id);
          this.socketSvc.emit('remove song', this.songToGroupSong(song));
        } else {
          console.error('Song cannot be removed if user did not choose this song: ' + song);
        }
        if (this.songs.length < 15) {
          this.minPlaylist = false;
        }
        this.loggingSvc.step4();
        return;
      }
    }
    console.error('Song cannot be removed if not in playlist: ' + song);
  }

  getGroupSongs() {
    // this.requestGroupSongs();
    return this.songs;
  }

  setGroupSongs(groupSongs) {
    // this.requestGroupSongs();
    this.songs = groupSongs;
  }

  updateRemovedSong(groupSong, userid) {
    let i = -1;
    for (const s of this.songs) {
      i++;
      if (s.id == groupSong.id) {
        if (s.userids.includes(userid)) {
          if (s.userids.length > 1) {
            s.userids.splice(s.userids.indexOf(userid), 1);
          } else {
            this.songs.splice(i, 1);
          }
        }
        if (this.songs.length < 15) {
          this.minPlaylist = false;
        }
        return;
      }
    }
    console.log('Wrong update: user did not select the song to be removed');
  }

  updateAddedSong(groupSong, userid) {
    for (const s of this.songs) {
      if (s.id == groupSong.id) {
        if (!s.userids.includes(userid)) {
          s.userids.push(userid);
        } else {
          console.log('Wrong update: user already selected the song to be added');
        }
        return;
      }
    }
    this.songs.push(groupSong);
    if (this.songs.length > 14) {
      this.minPlaylist = true;
    }
  }

  songToGroupSong(song) {
    const groupname = localStorage.getItem('groupname');
    return new GroupSong(groupname, this.userid, song);
  }

  getNbSlcPerMember() {
    const groupname = localStorage.getItem('groupname');
    const userid = localStorage.getItem('userid');
    const url = this.loggingSvc.backendUrl + '/playlist/nbslc-per-member?groupname=' + groupname + '&userid=' + userid;
    return new Promise ((resolve, reject) => {
      this.http.get(url).subscribe(
        (data: any) => {
          const members = this.loginSvc.getGroupMembers();
          for (const u of members) {
            let flag = false;
            for (const user of data) {
              if (user.id == u.id) {
                user.name = this.loginSvc.getUserName(user.id);
                flag = true;
                break;
              }
            }
            if (!flag) {
              data.push({id: u.id, name: u.username, nbslc: 0});
            }
          }
          resolve(data);
        },
        err => {
          console.error(err);
          reject(err);
        }
      );
    });
  }

  getFinalPlaylist(flag) {
    const groupname = localStorage.getItem('groupname');
    const url = this.loggingSvc.backendUrl + '/playlist/final?groupname=' + groupname + '&flag=' + flag;
    return new Promise ((resolve, reject) => {
      this.http.get(url).subscribe(
        (data: any) => {
          resolve(data);
        },
        err => {
          console.error(err);
          reject(err);
        }
      );
    });
  }

}
