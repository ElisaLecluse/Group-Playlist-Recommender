import { Component, OnInit } from '@angular/core';
import {LoginService} from '../../../services/login.service';
import {PlaylistService} from '../../../services/playlist.service';
import {LoggingService} from '../../../services/logging.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-fairness',
  templateUrl: './fairness.component.html',
  styleUrls: ['./fairness.component.css']
})
export class FairnessComponent implements OnInit {

  questions = [];
  answers = new Map();
  topsongs = [];
  lastsongs = [];
  nb = 0;
  overflow = false;

  constructor(private loginSvc: LoginService,
              private playlistSvc: PlaylistService,
              private loggingSvc: LoggingService,
              private router: Router) { }

  getUsers() {
    return this.loginSvc.users;
  }

  getUserColor(userid) {
    return this.loginSvc.getColor(userid);
  }

  getUserName(userid) {
    return this.loginSvc.getUserNameLike(userid);
  }

  onChange($event, questionNb) {
    this.answers.set(questionNb, $event.value);
  }

  allAnswered() {
    return this.answers.size > 13;
  }

  onClickNext() {
    this.router.navigate(['/selecttop']);
    for (const q of this.questions) {
      q.a = this.answers.get(q.i);
    }
    this.questions.push({i: 15,
      q: 'Do you have any suggestions to make the ranking of songs in the playlist more fair?',
      a: (document.getElementById('fairnessquestion') as HTMLInputElement).value});
    this.loggingSvc.log('fairness', this.questions);
  }

  ngOnInit(): void {
    this.loginSvc.setGroupMembers();
    this.loginSvc.getFlag().then((flag) => {
      this.playlistSvc.getFinalPlaylist(flag).then((data: any) => {
        for (const song of data.topsongs) {
          this.topsongs.push(song.track);
        }
        for (const song of data.lastsongs) {
          this.lastsongs.push(song.track);
        }
        this.nb = data.topsongs.length;
        this.questions = [
          {i: 1, q: 'I feel happy with the number of songs I liked in the final playlist'},
          {i: 2, q: 'I think someone of the group will feel disadvantaged with the final playlist'},
          {i: 3, q: 'I think everyone of the group will like the final group playlist'},
          {i: 4, q: 'I like the final group playlist'},
          {i: 5, q: 'I feel like the ranking algorithm is fair (i.e. every group member has some songs they like in the top ' + this.nb + ' playlist)?'},
          {i: 6, q: 'I feel like the songs are evenly ranked regarding who liked them (i.e. every group member has a song he/she liked highly ranked)?'},
          {i: 7, q: 'I would play the final group playlist with the others of the group'},
          {i: 8, q: 'I would play the final group playlist even when the others of the group are not present'},
          {i: 9, q: 'I would play the full group playlist (including the songs below the blue line) with the others of the group'},
          {i: 10, q: 'I would play the full group playlist (including the songs below the blue line) even when the others of the group are not present'},
          {i: 11, q: 'I think this is a good application to make a fair group playlist'},
          {i: 12, q: 'Fairness is important in group playlists'},
          {i: 13, q: 'It is more important that a majority of the group likes the playlist than that someone’s songs are left out'},
          {i: 14, q: 'I want at least some of my songs to be in the playlist, even if no one likes them'},
        ];
        setTimeout(() => {
          const last = this.lastsongs[this.lastsongs.length - 1];
          const lastpos = document.getElementById(last.id).getBoundingClientRect().bottom;
          const boxpos = document.getElementById('playlistbox').getBoundingClientRect().bottom;
          this.overflow = boxpos < (lastpos - 15);
          console.log(boxpos < lastpos);
          console.log('box', document.getElementById('playlistbox').getBoundingClientRect().bottom);
          console.log('last', document.getElementById(last.id).getBoundingClientRect().bottom);
        }, 3000);
      });
    });
  }

}
