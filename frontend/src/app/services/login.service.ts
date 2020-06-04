import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  // backendUrl = 'http://picasso.experiments.cs.kuleuven.be:3902/login';
  backendUrl = 'http://localhost:3902/login';
  users = [];
  currentClr = '#84B8FF';
  colors = ['#2ECC71', 'rgba(0, 64, 153, 0.7)', '#E74C3C', '#9B59B6', '#F39C12'];

  constructor(private router: Router, private http: HttpClient) { }

  register(loginModel) {
    const url = this.backendUrl;
    // + '?username=' + loginModel.username + '&groupname=' + loginModel.groupname;
    return new Promise ((resolve, reject) => {
      this.http.post(url, loginModel).subscribe(
        (data: any) => {
          console.log(data._id);
          localStorage.setItem('userid', data._id);
          localStorage.setItem('groupname', data.groupname);
          resolve(data);
        },
        err => {
          reject(err.error.message);
        }
      );
    });
  }

  // register(loginModel) {
  //   const url = this.backendUrl;
  //   // + '?username=' + loginModel.username + '&groupname=' + loginModel.groupname;
  //   return new Promise ((resolve, reject) => {
  //     this.http.post(url, loginModel).subscribe(
  //       (data: any) => {
  //         this.loggedIn().then((flag) => {
  //           if (flag) {
  //             localStorage.setItem('userid', data._id);
  //             localStorage.setItem('groupname', data.groupname);
  //             window.open(this.loggingSvc.backendUrl + '/auth/login?userid=' + data._id + '&groupname=' + data.groupname, '_self');
  //           } else {
  //             this.http.get(url + '/remove-user?userid=' + data._id).subscribe(
  //               () => {
  //                 this._snackBar.open('Failed to login, please try again', 'ok', {
  //                   duration: 2000});
  //               }, err => {
  //                 reject(err.error.message);
  //               }
  //             );
  //           }
  //         });
  //         resolve(data);
  //       },
  //       err => {
  //         reject(err.error.message);
  //       }
  //     );
  //   });
  // }

  sendConsent(consentModel) {
    const url = this.backendUrl + '/consent';
    return new Promise ((resolve, reject) => {
      this.http.post(url, consentModel).subscribe(
        (data: any) => {
          console.log(data);
          resolve(data);
        },
        err => {
          reject(err.error.message);
        }
      );
    });
  }

  setFlag() {
    const userid = localStorage.getItem('userid');
    const url = this.backendUrl + '/setflag?userid=' + userid;
    return new Promise ((resolve, reject) => {
      this.http.get(url).subscribe(
        (data: any) => {
          resolve(data);
        },
        err => {
          reject(err.error.message);
        }
      );
    });
  }

  getFlag() {
    const userid = localStorage.getItem('userid');
    const url = this.backendUrl + '/flag?userid=' + userid;
    return new Promise ((resolve, reject) => {
      this.http.get(url).subscribe(
        (data: any) => {
          resolve(data);
        },
        err => {
          reject(err.error.message);
        }
      );
    });
  }

  loggedIn(): Promise<boolean> {
    const userid = localStorage.getItem('userid') || null;
    const url = this.backendUrl + '/token?userid=' + userid;
    return new Promise<boolean>((resolve, reject) => {
      this.http.get(url).subscribe(
        (data) => {
          if (data) {
            resolve(true);
          } else {
            this.router.navigate(['/login']);
            resolve(false);
          }
        },
        err => {
          this.router.navigate(['/login']);
          reject(err);
          resolve(false);
        }
      );
    });
  }

  addUser(userid, username) {
    for (const user of this.users) {
      if (user.id == userid) {
        return;
      }
    }
    if (userid == localStorage.getItem('userid')) {
      this.users.unshift({id: userid, username: username, color: this.currentClr});
    } else {
      this.users.push({id: userid, username: username, color: (this.colors.pop() || '#F4D03F')});
    }
  }

  getGroupMembers() {
    return this.users;
  }

  setGroupMembers() {
    const groupname = localStorage.getItem('groupname');
    const url = this.backendUrl + '/groupmembers?groupname=' + groupname;
    return new Promise ((resolve, reject) => {
      this.http.get(url).subscribe(
        (users: any) => {
          for (const user of users) {
            this.addUser(user._id, user.username);
          }
          console.log('USERS: ', this.users);
          resolve(users);
        },
        err => {
          reject(err.error.message);
        }
      );
    });
  }

  getUserNameLike(userid) {
    if (userid == localStorage.getItem('userid')) {
      return 'You like';
    }
    for (const user of this.users) {
      if (user.id == userid) {
        return user.username + ' likes';
      }
    }
  }

  getUserName(userid) {
    for (const user of this.users) {
      if (user.id == userid) {
        return user.username;
      }
    }
  }

  getColor(userid) {
    for (const user of this.users) {
      if (user.id == userid) {
        return user.color;
      }
    }
    return 'transparent';
  }

}
