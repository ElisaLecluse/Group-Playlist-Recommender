import { Component, OnInit } from '@angular/core';
import {SocketService} from '../../../services/socket.service';
import {AudioService} from '../../../services/audio.service';
import {HttpClient} from '@angular/common/http';
import {PlaylistService} from '../../../services/playlist.service';
import {Router} from '@angular/router';
import {LoginService} from '../../../services/login.service';
import {LoggingService} from "../../../services/logging.service";

@Component({
  selector: 'app-finalplaylist',
  templateUrl: './finalplaylist.component.html',
  styleUrls: ['./finalplaylist.component.css']
})
export class FinalplaylistComponent implements OnInit {

  tracks = [];
  stars = [];
  ratingCompleted = false;
  dinner;

  constructor(private socketSvc: SocketService,
              private audioSvc: AudioService,
              private playlistSvc: PlaylistService,
              private loginSvc: LoginService,
              private loggingSvc: LoggingService,
              private http: HttpClient,
              private router: Router) { }

  isPlaying(id): boolean {
    return this.audioSvc.isPlaying(id);
  }

  getPlayableColor(track) {
    return this.audioSvc.getColor(false, track.previewUrl);
  }

  playSong(track, preview) {
    this.audioSvc.playSong(track, preview);
  }

  pauseSong(id) {
    this.audioSvc.pauseSong(id);
  }

  mouseEnter(id, starnb) {
    for (const s of this.stars) {
      if (id == s.id) {
        s.star = starnb;
        return;
      }
    }
  }

  mouseLeave(id) {
    for (const s of this.stars) {
      if (id == s.id) {
        s.star = s.clicked;
        return;
      }
    }
  }

  onStarClick(id, starnb) {
    let allrated = true;
    for (const s of this.stars) {
      if (id == s.id) {
        s.clicked = starnb;
        s.star = starnb;
      }
      if (s.clicked == 0) {
        allrated = false;
      }
    }
    if (allrated) {
      this.ratingCompleted = true;
    }
  }

  getStarColor(id, starnb) {
    return this.isFilled(id, starnb) ? 'rgba(0, 64, 153, 0.6)' : 'rgba(0, 0, 0, 0.2)';
  }

  isFilled(id, starnb) {
    for (const s of this.stars) {
      if (id == s.id) {
        return starnb <= s.star;
      }
    }
    return false;
  }

  onClickNext() {
    const url = this.loggingSvc.backendUrl + '/playlist/rating';
    return new Promise ((resolve, reject) => {
      this.http.post(url, {userid: localStorage.getItem('userid'), ratings: this.stars}).subscribe(
        (data: any) => {
          console.log(data);
          this.loginSvc.getFlag().then((flag: any) => {
            if (flag) {
              window.open(
                'https://kuleuven.eu.qualtrics.com/jfe/form/SV_9ZeS4ZpLA4x8Nud?userid='
                + localStorage.getItem('userid'), '_self');
            } else {
              this.loggingSvc.setFlag();
              this.loginSvc.setFlag();
              this.router.navigate(['/task']);
            }
          });
          resolve(data);
        },
        err => {
          reject(err.error.message);
        }
      );
    });
  }

  ngOnInit(): void {
    this.loginSvc.getFlag().then((flag) => {
      this.playlistSvc.getFinalPlaylist(flag).then((data: any) => {
        const songs = [];
        for (const song of data.topsongs) {
          songs.push(song.track);
          this.stars.push({id: song.track.id, star: 0, clicked: 0});
        }
        for (const song of data.lastsongs) {
          songs.push(song.track);
          this.stars.push({id: song.track.id, star: 0, clicked: 0});
        }
        songs.sort(() => Math.random() - 0.5);
        this.tracks = songs;
      });
      const groupname = localStorage.getItem('groupname');
      if ((groupname.charAt(1) == '1' && flag) || (groupname.charAt(1) == '2' && !flag)) {
        this.dinner = true;
      }
      if ((groupname.charAt(1) == '2' && flag) || (groupname.charAt(1) == '1' && !flag)) {
        this.dinner = false;
      }
    });
  }

}
