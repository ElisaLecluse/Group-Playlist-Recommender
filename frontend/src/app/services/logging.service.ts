import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  // backendUrl = 'http://picasso.experiments.cs.kuleuven.be:3902';
  backendUrl = 'http://localhost:3902';

  flag1 = false;
  flag2 = false;
  private play1 = false;
  private play2 = false;
  flag3 = false;
  private addcount = 0;
  flag4 = false;
  flag5 = false;
  flag6 = false;
  flag;

  constructor(private http: HttpClient) { }

  log(action, details) {
    const url = this.backendUrl + '/log';
    return new Promise ((resolve, reject) => {
      this.http.post(url, {
        userid: this.getUserid(),
        action: action,
        details: details
      }).subscribe(
        (data: any) => {
          resolve(data);
        },
        err => {
          reject(err.error.message);
        }
      );
    });
  }

  addFlag(flagnb) {
    const userid = localStorage.getItem('userid');
    const url = this.backendUrl + '/log/add-tutflag?userid=' + userid + '&flagnb=' + flagnb;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(
        () => {
          resolve();
        },
        err => {
          reject(err.error.message);
        }
      );
    });
  }

  getUserid() {
    if (window.location.pathname == '/tutorial') {
      return 'Test';
    } else {
      return localStorage.getItem('userid');
    }
  }

  step1() {
    const userid = this.getUserid();
    if (userid == 'Test' && !this.flag1) {
      this.addFlag(1);
      document.getElementById('step1').style.visibility = 'hidden';
      document.getElementById('step2').style.visibility = 'visible';
      this.flag1 = true;
    }
  }

  step2(redirected: boolean) {
    const userid = this.getUserid();
    if (userid == 'Test' && !this.flag2 && this.flag1) {
      if (redirected) {
        this.play2 = true;
        if (this.play1) {
          document.getElementById('step2').style.visibility = 'hidden';
          document.getElementById('step3').style.visibility = 'visible';
          this.addFlag(2);
          this.flag2 = true;
        }
      } else {
        this.play1 = true;
        if (this.play2) {
          document.getElementById('step2').style.visibility = 'hidden';
          document.getElementById('step3').style.visibility = 'visible';
          this.addFlag(2);
          this.flag2 = true;
        }
      }
    }
  }

  step3() {
    const userid = this.getUserid();
    if (userid == 'Test') {
      this.addcount++;
      if (!this.flag3 && this.flag2) {
        if (this.addcount > 1) {
          document.getElementById('step3').style.visibility = 'hidden';
          document.getElementById('step4').style.visibility = 'visible';
          this.addFlag(3);
          this.flag3 = true;
        }
      }
    }
  }

  step4() {
    const userid = this.getUserid();
    if (userid == 'Test' && !this.flag4 && this.flag3) {
      document.getElementById('step4').style.visibility = 'hidden';
      document.getElementById('step5').style.visibility = 'visible';
      this.addFlag(4);
      this.flag4 = true;
    }
  }

  step5() {
    const userid = this.getUserid();
    if (userid == 'Test' && !this.flag5 && this.flag4) {
      this.addFlag(5);
      this.flag5 = true;
    }
  }

  setFlag() {
    this.flag = true;
  }
  getFlag() {
    return this.flag;
  }

}
