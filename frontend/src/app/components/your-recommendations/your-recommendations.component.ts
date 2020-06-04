import { Component, OnInit } from '@angular/core';
import {SpotifyService} from '../../services/spotify.service';
import {SocketService} from '../../services/socket.service';
import {LoggingService} from '../../services/logging.service';

@Component({
  selector: 'app-your-recommendations',
  templateUrl: './your-recommendations.component.html',
  styleUrls: ['./your-recommendations.component.css']
})
export class YourRecommendationsComponent implements OnInit {

  parent = 'your';

  constructor(private spotifySvc: SpotifyService,
              private socketSvc: SocketService,
              private loggingSvc: LoggingService) { }

  refreshUserRec() {
    this.spotifySvc.updateUserRecommendations();
    this.loggingSvc.log('refresh userrec', '');
  }

  getCount() {
    return this.spotifySvc.userrecCount;
  }

  showCount() {
    return this.spotifySvc.userrecCount > 0;
  }

  ngOnInit(): void {
    const userid = localStorage.getItem('userid');
    this.socketSvc.listen('userrec').subscribe(
      (data: any) => {
        const tutorial = this.spotifySvc.getTutorial();
        if ((tutorial && data.version == 'Test')
          || !tutorial && data.version != 'Test') {
          if (data.userid == userid) {
            this.spotifySvc.addUserRecommendations(data.userrec);
          }
        }
      });
  }

}
