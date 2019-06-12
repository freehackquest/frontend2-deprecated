import { Injectable, EventEmitter, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

declare var fhq: any;

@Injectable({
  providedIn: 'root'
})
export class FhqService {
  isAuthorized: boolean = false;
  serverHost: string = 'some';
  currentProtocol: string = 'http:';
  userdata: any = {};
  changedState = new EventEmitter<any>();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private _toastr: ToastrService,
  ) {
    this.serverHost = document.location.hostname;
    this.currentProtocol = document.location.protocol;

    fhq.bind('disconnected', () => this.connectToServer() );
    fhq.bind('userdata', (data: any) => this.updateUserData(data));
    fhq.bind('notify', (data: any) => this.showNotification(data));
  }
  
  showNotification(data: any) {
    console.log(data);

    if (data.type === 'info') {
      this._toastr.info(data.message)
    } else if (data.type === 'success') {
      this._toastr.success(data.message)
    } else if (data.type === 'danger') {
      this._toastr.error(data.message)
    } else if (data.type === 'warning') {
      this._toastr.warning(data.message)
    } else {
      // unknown type of message
      this._toastr.warning(data.message)
    }
  }

  updateUserData(data: any) {
    console.log("updateUserData: ", data);
    this.isAuthorized = data.nick != undefined;
    this.userdata = data;
    this.changedState.emit();
  }

  connectToServer() {
    console.log("connectToFhq");
    let baseUrl = 'ws://' + this.serverHost + ':1234/api-ws/';
    if (this.currentProtocol == "https:") {
      baseUrl = 'wss://' + this.serverHost + ':4613/api-wss/';
    }
    
    if (this.serverHost == 'freehackquest.com') {
      baseUrl = 'wss://freehackquest.com/api-wss/';
    }
    fhq.init({'baseUrl': baseUrl});
  }

  logout() {
    fhq.deinit();
    location.reload();
  }

  api() {
    return fhq;
  }
}
