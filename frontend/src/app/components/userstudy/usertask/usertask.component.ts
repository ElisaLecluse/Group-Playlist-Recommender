import { Component, OnInit } from '@angular/core';
import {LoginService} from '../../../services/login.service';
import {Router} from '@angular/router';
import {LoggingService} from '../../../services/logging.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-usertask',
  templateUrl: './usertask.component.html',
  styleUrls: ['./usertask.component.css']
})
export class UsertaskComponent implements OnInit {

  dinner;
  flag;

  constructor(private loginSvc: LoginService, private loggingSvc: LoggingService, private router: Router, private http: HttpClient) { }

  onClick() {
    this.resetTrackattr();
    // window.open('http://picasso.experiments.cs.kuleuven.be:3901/', '_self');
    window.open('http://localhost:4444/', '_self');
    // this.router.navigate(['']);
  }

  resetTrackattr() {
    return new Promise((resolve, reject) => {
      this.http.get(this.loggingSvc.backendUrl + '/login/reset-trackattr?userid='
        + localStorage.getItem('userid')).subscribe(
        (msg) => resolve(msg), () => reject());
    });
  }

  ngOnInit(): void {
    const groupname = localStorage.getItem('groupname');
    if (this.loggingSvc.getFlag()) {
      this.flag = true;
      if ((groupname.charAt(1) == '1' && this.flag) || (groupname.charAt(1) == '2' && !this.flag)) {
        this.dinner = true;
      }
      if ((groupname.charAt(1) == '2' && this.flag) || (groupname.charAt(1) == '1' && !this.flag)) {
        this.dinner = false;
      }
    } else {
      this.loginSvc.getFlag().then((flag: any) => {
        this.flag = flag;
        if ((groupname.charAt(1) == '1' && flag) || (groupname.charAt(1) == '2' && !flag)) {
          this.dinner = true;
        }
        if ((groupname.charAt(1) == '2' && flag) || (groupname.charAt(1) == '1' && !flag)) {
          this.dinner = false;
        }
      });
    }
  }

}
