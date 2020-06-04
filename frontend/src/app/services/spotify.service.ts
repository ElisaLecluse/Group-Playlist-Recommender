import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Track} from '../models/track.model';
import {LoggingService} from './logging.service';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  // private backendUrl = 'http://picasso.experiments.cs.kuleuven.be:3902/spotify';
  private backendUrl = 'http://localhost:3902/spotify';
  private userrec = [];
  private grouprec = [];
  private selected = [];
  userrecCount = 0;
  grouprecCount = 0;

  constructor(private http: HttpClient, private loggingSvc: LoggingService) { }

  searchMusic(str: string) {
    const userid = localStorage.getItem('userid');
    const url = this.backendUrl + '/search?userid=' + userid + '&str=' + str;
    return new Promise ((resolve, reject) => {
      this.http.get(url).subscribe(
        (data: any) => {
          const res = data.tracks.items;
          const tracks = [];
          for (const i of res) {
            tracks.push(this.dataToTrack(i));
          }
          resolve(tracks);
        },
        err => {
          console.error(err);
          reject(err);
        }
      );
    });
  }

  updateUserRecommendations() {
    const userid = localStorage.getItem('userid');
    const url = this.backendUrl + '/update-userrec?userid=' + userid + '&tutorial=' + this.getTutorial();
    return new Promise ((resolve, reject) => {
      this.http.get(url).subscribe(
        (data: any) => {
          this.setUserRecommendations(data);
          this.loggingSvc.step5();
          resolve(data);
        },
        err => {
          console.error(err);
          reject(err);
        }
      );
    });
  }

  updateGroupRecommendations() {
    const userid = localStorage.getItem('userid');
    const groupname = localStorage.getItem('groupname');
    const url = this.backendUrl + '/update-grouprec?userid=' + userid + '&groupname=' + groupname + '&tutorial=' + this.getTutorial();
    return new Promise ((resolve, reject) => {
      this.http.get(url).subscribe(
        (data: any) => {
          this.setGroupRecommendations(data);
          this.loggingSvc.step5();
          resolve(data);
        },
        err => {
          console.error(err);
          reject(err);
        }
      );
    });
  }

  requestSelected() {
    const userid = localStorage.getItem('userid');
    const url = this.backendUrl + '/userselected?userid=' + userid + '&tutorial=' + this.getTutorial();
    return new Promise ((resolve, reject) => {
      this.http.get(url).subscribe(
        (data: any) => {
          this.selected = data.trackids.concat(data.old);
          console.log('SELECTED', this.selected);
          resolve(this.selected);
        },
        err => {
          console.error(err);
          reject(err);
        }
      );
    });
  }

  getTrack(trackid: string) {
    const userid = localStorage.getItem('userid');
    const url = this.backendUrl + '/track?userid=' + userid + '&trackid=' + trackid;
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

  getRecommendations(trackId) {
    const userid = localStorage.getItem('userid');
    const url = this.backendUrl + '/recommendations?userid=' + userid + '&track_id=' + trackId;
    console.log(url);
    return new Promise ((resolve, reject) => {
      this.http.get(url).subscribe(
        (data: any) => {
          const res = data.tracks;
          const tracks = [];
          for (const i of res) {
            tracks.push(this.dataToTrack(i));
          }
          resolve(tracks);
        },
        err => {
          console.error(err);
          reject(err);
        }
      );
    });
  }

  checkUserVisibility(tracks) {
    for (const track of tracks) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting === true) {
          this.userrecCount--;
          document.getElementById('your' + track.id).style.animation = 'colorinit, colorchange 4s ease-in 0s, 1.9s';
          observer.disconnect();
        }
      }, { threshold: [0.8] , root: document.getElementById('yourscrollbox') });
      setTimeout(() => {
        setTimeout(() => {this.userrecCount++; }, 50);
        observer.observe(document.getElementById('your' + track.id)); }, 1500);
    }
  }

  checkGroupVisibility(tracks) {
    for (const track of tracks) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting === true) {
          this.grouprecCount--;
          document.getElementById('group' + track.id).style.animation = 'colorinit, colorchange 4s ease-in 0s, 1.9s';
          observer.disconnect();
        }
      }, { threshold: [0.8] , root: document.getElementById('groupscrollbox') });
      setTimeout(() => {
        setTimeout(() => {this.grouprecCount++; }, 50);
        observer.observe(document.getElementById('group' + track.id)); }, 1500);
    }
  }

  addUserRecommendations(tracks) {
    this.userrec = tracks.concat(this.userrec);
    this.updateUseridsTrack(this.userrec);
    this.checkUserVisibility(tracks);
  }

  addGroupRecommendations(tracks) {
    this.grouprec = tracks.concat(this.grouprec);
    this.updateUseridsTrack(this.grouprec);
    this.checkGroupVisibility(tracks);
  }

  setUserRecommendations(tracks) {
    this.userrec = tracks;
    this.updateUseridsTrack((this.userrec));
  }

  setGroupRecommendations(tracks) {
    this.grouprec = tracks;
    this.updateUseridsTrack((this.grouprec));
  }

  getUserRecommendations() {
    return this.userrec;
  }

  getGroupRecommendations() {
    return this.grouprec;
  }

  addSelected(trackid) {
    if (!this.selected.includes(trackid)) {
      this.selected.push(trackid);
    }
  }

  removeSelected(trackid) {
    const i = this.selected.indexOf(trackid);
    if (i > -1) {
      this.selected.splice(i, 1);
    }
  }

  getSelected() {
    return this.selected;
  }

  // addRecommendedTracks(tracks) {
  //   this.tracks = tracks.concat(this.tracks);
  // }

  // getRecommendedTracks() {
  //   return this.tracks;
  // }

  updateUseridsTrack(tracks) {
    if (tracks == []) {return}
    const ids = this.getSelected();
    const userid = localStorage.getItem('userid');
    for (const t of tracks) {
      if (ids.includes(t.id)) {
        if (!t.userids.includes(userid)) {
          t.userids.push(userid);
        }
      }
    }
  }

  dataToTrack(data): Track {
    return {
      id: data.id,
      name: data.name,
      artists: this.dataToArtists(data),
      previewUrl: data.preview_url,
      userids: [localStorage.getItem('userid')]
    };
  }

  private dataToArtists(data) {
    let artistStr = '';
    let firstflag = true;
    for (const i of data.artists) {
      if (firstflag) {
        artistStr = i.name;
        firstflag = false;
      } else {
        artistStr += ', ' + i.name;
      }
    }
    return artistStr;
  }

  getTutorial() {
    if (window.location.pathname == '/tutorial') {
      return true;
    } else {
      return false;
    }
  }
}
