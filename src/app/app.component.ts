import { Component, OnInit, Inject, ChangeDetectorRef} from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { DOCUMENT } from '@angular/platform-browser';

declare var fhq: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  serverHost: string = 'some';
  currentProtocol: string = 'http:';
  userdata: any = {};
  loggined: boolean = false;

  constructor(
    public locale: LocaleService,
    public _translation: TranslationService,
    @Inject(DOCUMENT) private document: Document,
    private _cdr: ChangeDetectorRef,
  ) {
    this.serverHost = document.location.hostname;
    this.currentProtocol = document.location.protocol;
  }

  updateUserData(data: any) {
    console.log("updateUserData: ", data);
    this.loggined = data.nick != undefined;
    this.userdata = data;
    this._cdr.detectChanges();
  }

  ngOnInit(): void {
    
    // baseUrl = 'ws://freehackquest.com/api-ws/';
    // baseUrl = 'ws://localhost/api-ws/';
    fhq.bind('disconnected', () => this.connectToFhq() );
    fhq.bind('userdata', (data: any) => this.updateUserData(data));
    this.connectToFhq();
  }

  connectToFhq() {
    let baseUrl = 'ws://' + this.serverHost + ':1234/api-ws/';
    if (this.currentProtocol == "https:") {
      baseUrl = 'wss://' + this.serverHost + ':4613/api-wss/';
    }
    
    if (this.serverHost == 'freehackquest.com') {
      baseUrl = 'wss://freehackquest.com/api-wss/';
    }
    fhq.init({'baseUrl': baseUrl});
  }

  userSignout() {
    fhq.deinit();
  }
}
