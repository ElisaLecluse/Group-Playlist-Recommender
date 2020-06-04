import { Component, OnInit } from '@angular/core';
import {LoggingService} from '../../../services/logging.service';

@Component({
  selector: 'app-end',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.css']
})
export class EndComponent implements OnInit {

  constructor(private loggingSvc: LoggingService) { }

  getPlaylistUrl() {
    return this.loggingSvc.backendUrl + '/songs-per-group?groupname=' + localStorage.getItem('groupname');
  }

  ngOnInit(): void {
    this.loggingSvc.log('completed', '');
  }

}
