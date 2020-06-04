import { Component, OnInit } from '@angular/core';
import {SocketService} from '../../services/socket.service';
import {SpotifyService} from '../../services/spotify.service';
import {LoggingService} from '../../services/logging.service';

@Component({
  selector: 'app-group-recommendations',
  templateUrl: './group-recommendations.component.html',
  styleUrls: ['./group-recommendations.component.css']
})
export class GroupRecommendationsComponent implements OnInit {

  parent = 'group';

  constructor(private socketSvc: SocketService,
              private spotifySvc: SpotifyService,
              private loggingSvc: LoggingService) { }

  refreshGroupRec() {
    this.spotifySvc.updateGroupRecommendations();
    this.loggingSvc.log('refresh grouprec', '');
  }

  getCount() {
    return this.spotifySvc.grouprecCount;
  }

  showCount() {
    return this.spotifySvc.grouprecCount > 0;
  }

  ngOnInit(): void {
    const groupname = localStorage.getItem('groupname');
    this.socketSvc.listen('grouprec').subscribe(
      (data: any) => {
        const tutorial = this.spotifySvc.getTutorial();
        if ((tutorial && data.version == 'Test')
          || !tutorial && data.version != 'Test') {
          if (data.groupname == groupname) {
            this.spotifySvc.addGroupRecommendations(data.grouprec);
          }
        }
      });
  }

}
