import { Component, OnInit } from '@angular/core';
import {LoginService} from '../../services/login.service';
import {LoggingService} from '../../services/logging.service';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-tokencheck',
  templateUrl: './tokencheck.component.html',
  styleUrls: ['./tokencheck.component.css']
})
export class TokencheckComponent implements OnInit {

  tokenfail = false;

  constructor(private loginSvc: LoginService, private loggingSvc: LoggingService, private http: HttpClient, private router: Router) { }

  onClick() {
    this.loggingSvc.log('login failed', '');
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    const userid = localStorage.getItem('userid');
    console.log(userid);
    const url = this.loggingSvc.backendUrl + '/login/remove-user?userid=' + userid;
    this.loginSvc.loggedIn().then((flag) => {
      if (flag) {
        window.open('https://kuleuven.eu.qualtrics.com/jfe/form/SV_bmDTCrLIWgY0nOJ?userid=' + userid, '_self');
      } else {
        this.http.get(url).subscribe(
          () => {
            this.tokenfail = true;
          }, err => {
            console.log(err.error.message);
          }
        );
      }
    });
  }

}
