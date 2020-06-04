import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: any;
  // private backendUrl = 'http://picasso.experiments.cs.kuleuven.be:3902/';
  private backendUrl = 'http://localhost:3902/';

  constructor() {
    this.socket = io(this.backendUrl);
  }

  listen(eventName) {
    return new Observable(subscriber => {
      this.socket.on(eventName, data => {
        subscriber.next(data);
      });
    });
  }

  listenForDisconnect() {
    this.socket.on('error', err => {
      console.log('socket error', err);
      // this.socket.io.reconnect();
      this.socket = io(this.backendUrl);
    });
    this.socket.on('disconnect', reason => {
      console.log('socket disconnected', reason);
      // this.socket.io.reconnect();
      this.socket = io(this.backendUrl);
    });
  }

  emit(eventName, data) {
    this.socket.emit(eventName, data);
  }
}
