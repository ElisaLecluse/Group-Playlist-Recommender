import { Component, OnInit } from '@angular/core';
import {Login} from '../../models/login.model';
import {LoginService} from '../../services/login.service';
import {LoggingService} from '../../services/logging.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginModel = new Login('', '');
  errMessage = '';

  constructor(private loginSvc: LoginService, private loggingSvc: LoggingService) { }

  onClickRegister() {
    this.loginSvc.register(this.loginModel).then((data: any) => {
      window.open(this.loggingSvc.backendUrl + '/auth/login?userid=' + data._id + '&groupname=' + data.groupname, '_self');
    }, (err) => {
      console.log(err);
      if (err == 'User already in database') {
        this.errMessage = 'Please pick another username, this one is already chosen by another group member';
      } else {this.errMessage = err; }
    });
  }

  ngOnInit(): void {
    console.log('Final version running');
  }

}
